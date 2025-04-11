import { Service, IAgentRuntime, logger } from "@elizaos/core";
import { hypGenEvalLoop, stopHypGenEvalLoop } from "./anthropic/hypGenEvalLoop";
import { watchFolderChanges } from "./gdrive";
import { sql, eq } from "drizzle-orm";
import { fileMetadataTable, fileStatusEnum } from "src/db/schemas";
import { downloadFile, initDriveClient, FileInfo } from "./gdrive";
import { generateKaFromPdfBuffer } from "./kaService/kaService";
import { storeJsonLd } from "./gdrive/storeJsonLdToKg";

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
      name: "PROCESS_PDF",
      async execute(runtime, options, task) {
        await runtime.updateTask(task.id, {
          metadata: {
            updatedAt: Date.now(),
          },
        });
        const fileId = task.metadata.fileId;
        const fileInfo: FileInfo = {
          id: fileId as string,
        };
        const drive = await initDriveClient();
        logger.info("Downloading file");
        const fileBuffer = await downloadFile(drive, fileInfo);
        logger.info("Generating KA");
        const ka = await generateKaFromPdfBuffer(fileBuffer, runtime);

        // Store KA in knowledge graph using existing function
        try {
          const success = await storeJsonLd(ka);
          if (success) {
            logger.info("Successfully stored KA data in Oxigraph");
          }
        } catch (error) {
          logger.error("Error storing KA in knowledge graph:", error);
        }

        logger.log("task worker");
        await runtime.deleteTask(task.id);
        await runtime.db
          .update(fileMetadataTable)
          .set({ status: "processed" })
          .where(eq(fileMetadataTable.id, fileId as string));
      },
    });
    // const tasks = await runtime.getTasksByName("HGE");
    // if (tasks.length < 1) {
    //   const taskId = await runtime.createTask({
    //     name: "HGE",
    //     description:
    //       "Generate and evaluate hypothesis whilst streaming them to discord",
    //     tags: ["hypothesis", "judgeLLM"],
    //     metadata: { updateInterval: 1500, updatedAt: Date.now() },
    //   });
    //   logger.info("Task UUID:", taskId);
    // }
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

        logger.info(`Now: ${now}`);
        logger.info(`Last update: ${lastUpdate}`);
        logger.info(`Interval: ${interval}`);
        logger.info(
          `Now >= lastUpdate + interval: ${now >= lastUpdate + interval}`
        );
        logger.info(`lastUpdate + interval: ${lastUpdate + interval}`);

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

    setInterval(
      async () => {
        await processRecurringTasks();
      },
      3 * 60 * 1000
    );

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
