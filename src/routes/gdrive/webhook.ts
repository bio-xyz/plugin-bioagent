import { type Route, type IAgentRuntime, logger } from "@elizaos/core";
import { syncGoogleDriveChanges } from "../controller";
import { gdriveChannelsTable } from "src/db";

export const gdriveWebhook: Route = {
  path: "/gdrive/webhook",
  type: "POST",
  handler: async (req: any, res: any, runtime: IAgentRuntime) => {
    try {
      logger.info("Google Drive webhook triggered");
      // logger.info("Headers:", req.headers);

      // Extract the channel ID from headers
      const channelId = req.headers["x-goog-channel-id"];

      if (!channelId) {
        logger.warn("Missing x-goog-channel-id header in webhook request");
        return res.status(400).json({
          message: "Missing required channel ID header",
        });
      }

      // Check if the channel ID exists in the database
      const channels = await runtime.db.select().from(gdriveChannelsTable);

      if (channels.length === 0) {
        logger.warn("No channels found in database");
        return res.status(500).json({
          message: "No channels configured",
        });
      }

      // There should be only one row as mentioned
      const validChannelId = channels[0].id;

      if (channelId !== validChannelId) {
        logger.warn(
          `Invalid channel ID received: ${channelId}, expected: ${validChannelId}`
        );
        return res.status(403).json({
          message: "Invalid channel ID",
        });
      }

      logger.info(`Valid webhook from channel: ${channelId}`);
      const result = await syncGoogleDriveChanges(runtime);

      res.json({
        message: "OK",
        ...result,
      });
    } catch (error) {
      logger.error("Error processing Google Drive webhook:", error);
      res.status(500).json({
        message: "Error processing webhook",
        error: error.message,
      });
    }
  },
};
