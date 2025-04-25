import { driveSyncTable } from "src/db";
import { initDriveClient } from "../services/gdrive";
import { fileMetadataTable } from "src/db";
import { eq } from "drizzle-orm";
import { type IAgentRuntime, logger } from "@elizaos/core";
import { drive_v3 } from "googleapis";

type DriveChangeResponse = {
  changes: number;
  processed: number;
};

type DriveFileChange = drive_v3.Schema$Change;
type DriveFile = drive_v3.Schema$File;

/**
 * Synchronizes changes from Google Drive to the local database
 *
 * Fetches all changes since the last sync using the stored page token,
 * processes each change (add, update, delete) and updates the database accordingly.
 * Only processes PDF files, ignores other file types.
 *
 * @param runtime - Eliza agent runtime with DB access
 * @returns Object with count of detected changes and processed items
 */
export async function syncGoogleDriveChanges(
  runtime: IAgentRuntime
): Promise<DriveChangeResponse> {
  // --- Setup and initialization ---
  const driveSync = await fetchDriveSyncRecord(runtime);
  const { id: driveId, startPageToken, driveType } = driveSync;
  const drive = await initDriveClient([
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/drive",
  ]);

  // --- Fetch changes from Google Drive ---
  const params = buildDriveParams(startPageToken, driveId, driveType);
  const changesResponse = await drive.changes.list(params);
  const changes = changesResponse.data.changes || [];

  logger.info(`Found ${changes.length} changes in Google Drive`);

  // --- Process each change ---
  let processedCount = 0;
  for (const change of changes) {
    if (!change.fileId) continue; // Skip invalid changes

    processedCount++;
    await processChange(runtime, change);
  }

  // --- Update the sync token for next time ---
  if (changesResponse.data.newStartPageToken) {
    await updatePageToken(
      runtime,
      driveId,
      changesResponse.data.newStartPageToken
    );
  }

  // Return processing summary
  return {
    changes: changes.length,
    processed: processedCount,
  };
}

/**
 * Fetches the drive sync record from the database
 * @throws Error if no drive sync record exists
 */
async function fetchDriveSyncRecord(runtime: IAgentRuntime) {
  const driveSync = await runtime.db.select().from(driveSyncTable);

  if (driveSync.length === 0) {
    logger.error("No drive sync found, cannot process changes");
    throw new Error("Drive sync not initialized");
  }

  return driveSync[0];
}

/**
 * Builds the parameters for the Google Drive changes.list API call
 */
function buildDriveParams(
  startPageToken: string,
  driveId: string,
  driveType: string
): drive_v3.Params$Resource$Changes$List {
  // Base parameters
  const params: drive_v3.Params$Resource$Changes$List = {
    pageToken: startPageToken,
    includeRemoved: true,
    fields:
      "newStartPageToken, changes(fileId, removed, file(id, name, md5Checksum, size, trashed, mimeType))",
  };

  // Add drive-specific parameters
  if (driveType === "shared_drive") {
    params.driveId = driveId;
    params.supportsAllDrives = true;
    params.includeItemsFromAllDrives = true;
  } else if (driveType === "shared_folder") {
    params.spaces = "drive";
    params.restrictToMyDrive = false;
    (params as any).q = `'${driveId}' in parents`;
  }

  return params;
}

/**
 * Processes a single file change from Google Drive
 */
async function processChange(
  runtime: IAgentRuntime,
  change: DriveFileChange
): Promise<void> {
  // File is permanently removed
  if (change.removed) {
    logger.info(`File ${change.fileId} removed from trash - no action needed`);
    return;
  }

  // File exists but was moved to trash
  if (change.file?.trashed) {
    logger.info(
      `File ${change.fileId} moved to trash - removing from database`
    );
    await runtime.db
      .delete(fileMetadataTable)
      .where(eq(fileMetadataTable.id, change.fileId as string));
    return;
  }

  // New file or modified file that's not in trash
  if (change.file && !change.file.trashed) {
    await processFile(runtime, change.file);
  }
}

/**
 * Processes a file - only handles PDF files
 */
async function processFile(
  runtime: IAgentRuntime,
  file: DriveFile
): Promise<void> {
  // Only process PDF files
  if (file.mimeType !== "application/pdf") {
    logger.info(`Skipping non-PDF file: ${file.name} (${file.mimeType})`);
    return;
  }

  const fileExists = await runtime.db
    .select()
    .from(fileMetadataTable)
    .where(eq(fileMetadataTable.hash, file.md5Checksum as string));

  if (fileExists.length > 0) {
    logger.info(`File ${file.name} already exists, skipping`);
    return;
  }

  // Insert or update file in database first
  const result = await runtime.db
    .insert(fileMetadataTable)
    .values({
      id: file.id as string,
      hash: file.md5Checksum as string,
      fileName: file.name as string,
      fileSize: Number(file.size),
      modifiedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: fileMetadataTable.hash,
      set: {
        fileName: file.name as string,
        fileSize: Number(file.size),
        modifiedAt: new Date(),
        id: file.id as string,
      },
    })
    .returning();

  logger.info(`Result: ${JSON.stringify(result)}`);

  // Only create a task if a record was inserted or updated
  if (result.length > 0) {
    logger.info(`Adding task to queue: ${file.name}`);

    await runtime.createTask({
      name: "PROCESS_PDF",
      description: "Convert PDF to RDF triples and save to Oxigraph",
      tags: ["rdf", "graph", "process", "hypothesis"],
      metadata: {
        updateInterval: 3 * 60 * 1000,
        updatedAt: Date.now(),
        fileId: file.id as string,
        fileName: file.name as string,
        modifiedAt: new Date(),
      },
    });

    logger.info(`Saved/updated file metadata for ${file.name} (${file.id})`);
  } else {
    logger.info(`File ${file.name} hasn't changed, skipping task creation`);
  }
}

/**
 * Updates the page token for future syncs
 */
async function updatePageToken(
  runtime: IAgentRuntime,
  driveId: string,
  newToken: string
): Promise<void> {
  await runtime.db
    .update(driveSyncTable)
    .set({
      startPageToken: newToken,
      lastSyncAt: new Date(),
    })
    .where(eq(driveSyncTable.id, driveId));

  logger.info(`Updated start page token to: ${newToken}`);
}
