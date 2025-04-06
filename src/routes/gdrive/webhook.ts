import { type Route, type IAgentRuntime, logger } from "@elizaos/core";
import { syncGoogleDriveChanges } from "../controller";

export const gdriveWebhook: Route = {
  path: "/gdrive/webhook",
  type: "POST",
  handler: async (_req: any, res: any, runtime: IAgentRuntime) => {
    try {
      logger.info("Google Drive webhook triggered");
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
