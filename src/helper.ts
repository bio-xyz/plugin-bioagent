import { type IAgentRuntime, logger } from "@elizaos/core";
import { driveSyncTable, gdriveChannelsTable } from "src/db";
import { initDriveClient } from "./services/gdrive";
import { drive_v3 } from "googleapis";
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

// Configuration and constants
const ENV = process.env.ENV || "dev";
const deployedUrl = ENV === "dev" ? process.env.DEV_URL : process.env.PROD_URL;

// Type definitions
interface WatchResponse {
  resourceId: string;
  expiration: string;
  kind: string;
  id: string;
  resourceUri: string;
}

interface WatchOptions {
  includeItemsFromAllDrives?: boolean;
  supportsAllDrives?: boolean;
  corpora?: "user" | "domain" | "drive" | "allDrives";
  driveId?: string;
}

/**
 * Sets up a watch channel for file changes in a specific folder
 *
 * @param folderId - The ID of the folder to watch
 * @param callbackUrl - The URL where change notifications will be sent
 * @param drive - Google Drive client instance
 * @param options - Additional options for shared drives
 * @returns Promise containing the watch response
 */
async function watchFolderChanges(
  folderId: string,
  callbackUrl: string,
  drive: drive_v3.Drive,
  options: WatchOptions = {}
): Promise<WatchResponse> {
  // Create watch channel with 7-day expiration
  const response = await drive.files.watch({
    fileId: folderId,
    ...options,
    requestBody: {
      id: `channel-${Date.now()}`,
      type: "web_hook",
      address: callbackUrl,
      payload: true,
      expiration: (Date.now() + 604800000).toString(), // 7 days
    },
  });

  logger.info("Watch channel created:", JSON.stringify(response.data, null, 2));
  return response.data as WatchResponse;
}

/**
 * Stops watching changes for a specific channel
 *
 * @param channelId - ID of the channel to stop
 * @param resourceId - Resource ID associated with the channel
 * @param drive - Google Drive client instance
 */
async function stopWatchingChanges(
  channelId: string,
  resourceId: string,
  drive: drive_v3.Drive
): Promise<void> {
  await drive.channels.stop({
    requestBody: {
      id: channelId,
      resourceId: resourceId,
    },
  });
  logger.info(`Stopped watching channel ${channelId}`);
}

/**
 * Initializes sync with Google Drive
 * Sets up the database records and watch channels for Drive changes
 *
 * @param runtime - Eliza agent runtime with DB access
 */
export async function initDriveSync(runtime: IAgentRuntime): Promise<void> {
  const driveClient = await createDriveClient();
  const queryContext = createQueryContext();

  await setupDriveSyncRecord(runtime, driveClient, queryContext);
  await setupWatchChannel(runtime, driveClient, queryContext);
}

/**
 * Creates and initializes the Drive client
 */
async function createDriveClient(): Promise<drive_v3.Drive> {
  return await initDriveClient([
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ]);
}

/**
 * Creates the query context for Drive operations
 */
function createQueryContext(): ListFilesQueryContext {
  return new ListFilesQueryContext(
    process.env.GOOGLE_DRIVE_FOLDER_ID,
    process.env.SHARED_DRIVE_ID
  );
}

/**
 * Sets up the Drive sync record in the database
 */
async function setupDriveSyncRecord(
  runtime: IAgentRuntime,
  driveClient: drive_v3.Drive,
  queryContext: ListFilesQueryContext
): Promise<void> {
  const startPageTokenParams = queryContext.getStartPageTokenParams();
  const startPageTokenResponse =
    await driveClient.changes.getStartPageToken(startPageTokenParams);
  const startPageToken = startPageTokenResponse.data.startPageToken;
  const driveType = queryContext.getDriveType();
  const driveId = queryContext.getDriveId();

  const driveSync = await runtime.db.select().from(driveSyncTable);

  if (driveSync.length === 0) {
    logger.info("No drive sync found, creating new one");
    await runtime.db.insert(driveSyncTable).values({
      id: driveId,
      startPageToken,
      driveType,
    });
    logger.info(`Drive sync initialized with token ${startPageToken}`);
  } else {
    logger.info("Drive sync already initialized");
  }
}

/**
 * Sets up the watch channel for Drive changes
 */
async function setupWatchChannel(
  runtime: IAgentRuntime,
  driveClient: drive_v3.Drive,
  queryContext: ListFilesQueryContext
): Promise<void> {
  const driveId = queryContext.getDriveId();
  const webhookUrl = `${deployedUrl}/api/gdrive/webhook`;
  const gdriveChannel = await runtime.db.select().from(gdriveChannelsTable);

  if (gdriveChannel.length === 0) {
    await createNewWatchChannel(
      runtime,
      driveClient,
      driveId,
      webhookUrl,
      queryContext
    );
  } else if (gdriveChannel.length === 1) {
    await handleSingleChannel(
      runtime,
      driveClient,
      driveId,
      webhookUrl,
      queryContext,
      gdriveChannel[0]
    );
  } else if (gdriveChannel.length > 1) {
    await handleMultipleChannels(
      runtime,
      driveClient,
      driveId,
      webhookUrl,
      queryContext,
      gdriveChannel
    );
  }
}

/**
 * Creates a new watch channel when none exists
 */
async function createNewWatchChannel(
  runtime: IAgentRuntime,
  driveClient: drive_v3.Drive,
  driveId: string,
  webhookUrl: string,
  queryContext: ListFilesQueryContext
): Promise<void> {
  logger.info("Creating new watch channel");
  const watchFolderResponse = await watchFolderChanges(
    driveId,
    webhookUrl,
    driveClient,
    queryContext.getWatchFolderParams()
  );

  await saveWatchChannel(runtime, watchFolderResponse, driveId);
}

/**
 * Handles a single existing channel, refreshing if expired
 */
async function handleSingleChannel(
  runtime: IAgentRuntime,
  driveClient: drive_v3.Drive,
  driveId: string,
  webhookUrl: string,
  queryContext: ListFilesQueryContext,
  channel: any
): Promise<void> {
  logger.info("Found one channel, checking expiration...");

  if (channel.expiration < new Date()) {
    // Channel expired, create a new one
    try {
      await stopWatchingChanges(channel.id, channel.resourceId, driveClient);
    } catch (error) {
      logger.error(
        "Error stopping watching changes, continuing with new channel",
        error
      );
    }

    await runtime.db.delete(gdriveChannelsTable);
    await createNewWatchChannel(
      runtime,
      driveClient,
      driveId,
      webhookUrl,
      queryContext
    );
  } else {
    logger.info("Watch channel is still valid, no need to update");
  }
}

/**
 * Handles multiple existing channels by cleaning up and creating a new one
 */
async function handleMultipleChannels(
  runtime: IAgentRuntime,
  driveClient: drive_v3.Drive,
  driveId: string,
  webhookUrl: string,
  queryContext: ListFilesQueryContext,
  channels: any[]
): Promise<void> {
  logger.info("Multiple watch channels found, cleaning up...");

  // Stop all active channels
  for (const channel of channels) {
    if (channel.expiration < new Date()) {
      try {
        await stopWatchingChanges(channel.id, channel.resourceId, driveClient);
      } catch (error) {
        logger.error(
          "Error stopping watching changes, continuing with next channel",
          error
        );
      }
    }
  }

  // Delete all channel records
  await runtime.db.delete(gdriveChannelsTable);

  // Create a new channel
  await createNewWatchChannel(
    runtime,
    driveClient,
    driveId,
    webhookUrl,
    queryContext
  );
}

/**
 * Saves a watch channel to the database
 */
async function saveWatchChannel(
  runtime: IAgentRuntime,
  watchResponse: WatchResponse,
  resourceId: string
): Promise<void> {
  await runtime.db.insert(gdriveChannelsTable).values({
    kind: watchResponse.kind,
    id: watchResponse.id,
    resourceId,
    resourceUri: watchResponse.resourceUri,
    expiration: new Date(parseInt(watchResponse.expiration)),
  });

  logger.info(
    `Saved watch channel ${watchResponse.id}, expires: ${new Date(parseInt(watchResponse.expiration)).toISOString()}`
  );
}
