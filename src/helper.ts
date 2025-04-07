import { type IAgentRuntime, logger } from "@elizaos/core";
import { driveSyncTable } from "src/db";
import { initDriveClient } from "./services/gdrive";
import { ListFilesQueryContext } from "./services/gdrive/buildQuery";
import "dotenv/config";
import { migrateDb } from "./db/migration";

// Run migrations before initializing anything else
export async function initWithMigrations(runtime: IAgentRuntime) {
  try {
    // Run migrations first
    await migrateDb();

    // Then initialize drive sync
    await initDriveSync(runtime);
  } catch (error) {
    logger.error("Error during initialization:", error);
  }
}

export async function initDriveSync(runtime: IAgentRuntime) {
  const driveSync = await runtime.db.select().from(driveSyncTable);
  if (driveSync.length === 0) {
    logger.info("Initializing drive sync");
    logger.info("No drive sync found, creating new one");
    const driveClient = await initDriveClient();
    const listFilesQueryContext = new ListFilesQueryContext(
      process.env.GOOGLE_DRIVE_FOLDER_ID,
      process.env.SHARED_DRIVE_ID
    );
    const startPageTokenParams =
      listFilesQueryContext.getStartPageTokenParams();
    const startPageTokenResponse =
      await driveClient.changes.getStartPageToken(startPageTokenParams);
    const startPageToken = startPageTokenResponse.data.startPageToken;
    const driveType = listFilesQueryContext.getDriveType();
    const driveId = listFilesQueryContext.getDriveId();
    await runtime.db.insert(driveSyncTable).values({
      id: driveId,
      startPageToken,
      driveType,
    });
  } else {
    logger.info("Drive sync already initialized");
  }
}
