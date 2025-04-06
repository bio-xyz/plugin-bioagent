import { Service, IAgentRuntime, logger } from "@elizaos/core";
import { hypGenEvalLoop, stopHypGenEvalLoop } from "./anthropic/hypGenEvalLoop";
import { watchFolderChanges } from "./gdrive";
import { sql } from "drizzle-orm";
import { fileMetadataTable } from "src/db/schemas";

export class HypothesisService extends Service {
  static serviceType = "hypothesis";
  capabilityDescription = "Generate and judge hypotheses";
  constructor(protected runtime: IAgentRuntime) {
    super(runtime);
  }
  static async start(runtime: IAgentRuntime) {
    logger.info("*** Starting hypotheses service ***");
    const service = new HypothesisService(runtime);
    // const interval = await hypGenEvalLoop(runtime);
    runtime.registerTaskWorker({
      name: "HGE",
      async execute(runtime, options, task) {
        logger.log("task worker");
      },
    });
    const tasks = await runtime.getTasksByName("HGE");
    if (tasks.length < 1) {
      const taskId = await runtime.createTask({
        name: "HGE",
        description:
          "Generate and evaluate hypothesis whilst streaming them to discord",
        tags: ["hypothesis", "judgeLLM"],
        metadata: { updateInterval: 1500, updatedAt: Date.now() },
      });
      logger.info("Task UUID:", taskId);
    }
    // In an initialization function or periodic check
    async function processRecurringTasks() {
      logger.info("Starting processing loop");
      const now = Date.now();
      const recurringTasks = await runtime.getTasks({
        tags: ["hypothesis"],
      });
      logger.info("Got tasks", recurringTasks);

      for (const task of recurringTasks) {
        if (!task.metadata?.updateInterval) continue;

        const lastUpdate = (task.metadata.updatedAt as number) || 0;
        const interval = task.metadata.updateInterval;

        if (now >= lastUpdate + interval) {
          logger.info("Executing task");
          const worker = runtime.getTaskWorker(task.name);
          if (worker) {
            try {
              await worker.execute(runtime, {}, task);

              // Update the task's last update time
              await runtime.updateTask(task.id, {
                metadata: {
                  ...task.metadata,
                  updatedAt: now,
                },
              });
            } catch (error) {
              logger.error(`Error executing task ${task.name}: ${error}`);
            }
          }
        }
      }
    }
    await processRecurringTasks();

    // await watchFolderChanges(runtime);

    process.on("SIGINT", async () => {
      // stopHypGenEvalLoop(interval);
    });

    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info("*** Stopping hypotheses service ***");
    // get the service from the runtime
    const service = runtime.getService(HypothesisService.serviceType);
    if (!service) {
      throw new Error("Hypotheses service not found");
    }
    service.stop();
  }

  async stop() {
    logger.info("*** Stopping hypotheses service instance ***");
  }
}
