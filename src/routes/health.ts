import { type Route } from "@elizaos/core";

export const health: Route = {
  path: "/health",
  type: "GET",
  handler: async (_req: any, res: any) => {
    res.json({
      message: "OK",
    });
  },
};
