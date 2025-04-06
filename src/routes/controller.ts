import { driveSyncTable } from "src/db";
import { initDriveClient } from "../services/gdrive";
import { fileMetadataTable } from "src/db";
import { eq } from "drizzle-orm";
import { type IAgentRuntime, logger } from "@elizaos/core";

// Extract the file processing logic to a reusable function
export async function syncGoogleDriveChanges(runtime: IAgentRuntime) {
  // Get the drive sync data from the database
  const driveSync = await runtime.db.select().from(driveSyncTable);

  if (driveSync.length === 0) {
    logger.error("No drive sync found, cannot process changes");
    throw new Error("Drive sync not initialized");
  }

  // Get first drive sync record
  const syncRecord = driveSync[0];
  const { id: driveId, startPageToken, driveType } = syncRecord;

  // Initialize Drive client with necessary scopes
  const drive = await initDriveClient([
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/drive",
  ]);

  // Prepare parameters for changes.list API call
  const params: any = {
    pageToken: startPageToken,
    includeRemoved: true,
    fields:
      "newStartPageToken, changes(fileId, removed, file(id, name, md5Checksum, size, trashed, mimeType))",
  };

  // Add drive-specific parameters based on drive type
  if (driveType === "shared_drive") {
    params.driveId = driveId;
    params.supportsAllDrives = true;
    params.includeItemsFromAllDrives = true;
  } else if (driveType === "shared_folder") {
    params.spaces = "drive";
    params.restrictToMyDrive = false;
    params.q = `'${driveId}' in parents`;
  }

  // Get changes since last sync
  const changesResponse = await drive.changes.list(params);

  // Log the changes for debugging
  logger.info(`Found ${changesResponse.data.changes?.length || 0} changes`);

  // Process the changes
  let processedCount = 0;
  if (changesResponse.data.changes && changesResponse.data.changes.length > 0) {
    for (const change of changesResponse.data.changes) {
      // Skip the last empty change that Google Drive API sometimes includes
      if (!change.fileId) continue;

      processedCount++;

      // Case 1: File is permanently removed
      if (change.removed) {
        // Do nothing as per requirements
        logger.info(
          `File ${change.fileId} removed from trash - no action needed`
        );
      }
      // Case 2: File exists but was moved to trash
      else if (change.file?.trashed) {
        logger.info(
          `File ${change.fileId} moved to trash - removing from database`
        );

        // Delete from the database
        await runtime.db
          .delete(fileMetadataTable)
          .where(eq(fileMetadataTable.id, change.fileId));
      }
      // Case 3: New file or modified file that's not in trash
      else if (change.file && !change.file.trashed) {
        const file = change.file;

        // Only process PDF files
        if (file.mimeType === "application/pdf") {
          logger.info(`Processing PDF file: ${file.name}`);

          // Insert or update file in database
          await runtime.db
            .insert(fileMetadataTable)
            .values({
              id: file.id,
              hash: file.md5Checksum,
              fileName: file.name,
              fileSize: Number(file.size),
              modifiedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: fileMetadataTable.hash,
              set: {
                fileName: file.name,
                fileSize: Number(file.size),
                modifiedAt: new Date(),
                id: file.id,
              },
            });

          logger.info(
            `Saved/updated file metadata for ${file.name} (${file.id})`
          );
        } else {
          logger.info(`Skipping non-PDF file: ${file.name} (${file.mimeType})`);
        }
      }
    }
  }

  // Save the new token for next time
  if (changesResponse.data.newStartPageToken) {
    await runtime.db
      .update(driveSyncTable)
      .set({
        startPageToken: changesResponse.data.newStartPageToken,
        lastSyncAt: new Date(),
      })
      .where(eq(driveSyncTable.id, driveId));

    logger.info(
      `Updated start page token to: ${changesResponse.data.newStartPageToken}`
    );
  }

  return {
    changes: changesResponse.data.changes?.length || 0,
    processed: processedCount,
  };
}
