import { type Route, type IAgentRuntime, logger } from "@elizaos/core";
import { syncGoogleDriveChanges } from "../controller";

export const gdriveManualSync: Route = {
  path: "/gdrive/sync",
  type: "GET",
  handler: async (_req: any, res: any, runtime: IAgentRuntime) => {
    try {
      logger.info("Manual Google Drive sync triggered");
      const result = await syncGoogleDriveChanges(runtime);
      logger.info(`Changes: ${result.changes}`);
      while (result.changes > 0) {
        logger.info(`Changes: ${result.changes}`);
        await syncGoogleDriveChanges(runtime);
      }

      res.json({
        message: "Sync completed successfully",
        ...result,
      });
    } catch (error) {
      logger.error("Error during manual Google Drive sync:", error);
      res.status(500).json({
        message: "Error during sync",
        error: error.message,
      });
    }
  },
};
