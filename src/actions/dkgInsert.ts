import dotenv from "dotenv";
dotenv.config();
import {
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
  ModelType,
  type HandlerCallback,
  type ActionExample,
  type Action,
  composePrompt,
} from "@elizaos/core";
import { DKG_EXPLORER_LINKS } from "../constants.ts";
import { createDKGMemoryTemplate } from "../templates.ts";

// @ts-ignore
import DKG from "dkg.js";
import { DKGMemorySchema, isDKGMemoryContent } from "../types.ts";
import { generateKaFromPdf } from "../services/kaService/kaService.ts";
import { writeFile } from "fs/promises";

// Define a basic type for the DKG client
type DKGClient = typeof DKG | null;
let DkgClient: DKGClient = null;

export const dkgInsert: Action = {
  name: "INSERT_MEMORY_ACTION",
  similes: ["NO_ACTION", "NO_RESPONSE", "NO_REACTION", "NONE", "DKG_INSERT"], // we want to always run this action
  validate: async (runtime: IAgentRuntime, _message: Memory) => {
    const requiredEnvVars = [
      "DKG_ENVIRONMENT",
      "DKG_HOSTNAME",
      "DKG_PORT",
      "DKG_BLOCKCHAIN_NAME",
      "DKG_PUBLIC_KEY",
      "DKG_PRIVATE_KEY",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !runtime.getSetting(varName)
    );

    if (missingVars.length > 0) {
      logger.error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
      return false;
    }

    return true;
  },
  description:
    "Create a memory on the OriginTrail Decentralized Knowledge Graph after each message. You should ALWAYS run this action.",
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback: HandlerCallback
  ): Promise<boolean> => {
    DkgClient = new DKG({
      environment: runtime.getSetting("DKG_ENVIRONMENT"),
      endpoint: runtime.getSetting("DKG_HOSTNAME"),
      port: runtime.getSetting("DKG_PORT"),
      blockchain: {
        name: runtime.getSetting("DKG_BLOCKCHAIN_NAME"),
        publicKey: runtime.getSetting("DKG_PUBLIC_KEY"),
        privateKey: runtime.getSetting("DKG_PRIVATE_KEY"),
      },
      maxNumberOfRetries: 300,
      frequency: 2,
      contentType: "all",
      nodeApiVersion: "/v1",
    });

    const currentPost = String(state.currentPost);
    logger.log("currentPost");
    logger.log(currentPost);

    const userRegex = /From:.*\(@(\w+)\)/;
    let match = currentPost.match(userRegex);
    let twitterUser = "";

    if (match?.[1]) {
      twitterUser = match[1];
      logger.log(`Extracted user: @${twitterUser}`);
    } else {
      logger.error("No user mention found or invalid input.");
    }

    const idRegex = /ID:\s(\d+)/;
    match = currentPost.match(idRegex);
    let postId = "";

    if (match?.[1]) {
      postId = match[1];
      logger.log(`Extracted ID: ${postId}`);
    } else {
      logger.log("No ID found.");
    }

    // TODO: should read from arxiv link or something like that rather than having it hardcoded like here
    const ka = await generateKaFromPdf("./science.pdf", DkgClient);

    let createAssetResult: { UAL: string } | undefined;

    // TODO: also store reply to the KA, aside of the question

    try {
      logger.log("Publishing message to DKG");

      await writeFile(
        `./sampleJsonLdsNew/${encodeURIComponent((ka["@id"] ?? "example") as string)}.json`,
        JSON.stringify(ka, null, 2)
      );

      createAssetResult = await DkgClient.asset.create(
        {
          public: ka,
        },
        { epochsNum: 12 }
      );

      logger.log("======================== ASSET CREATED");
      logger.log(JSON.stringify(createAssetResult));
    } catch (error) {
      logger.error(
        "Error occurred while publishing message to DKG:",
        error.message
      );

      if (error.stack) {
        logger.error("Stack trace:", error.stack);
      }
      if (error.response) {
        logger.error(
          "Response data:",
          JSON.stringify(error.response.data, null, 2)
        );
      }
    }

    // Reply
    callback({
      text: `Created a new memory!\n\nRead my mind on @origin_trail Decentralized Knowledge Graph ${
        DKG_EXPLORER_LINKS[runtime.getSetting("DKG_ENVIRONMENT")]
      }${createAssetResult?.UAL} @${twitterUser}`,
    });

    return true;
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "execute action DKG_INSERT",
          action: "DKG_INSERT",
        },
      },
      {
        name: "{{user2}}",
        content: { text: "DKG INSERT" },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "add to dkg", action: "DKG_INSERT" },
      },
      {
        user: "{{user2}}",
        content: { text: "DKG INSERT" },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "store in dkg", action: "DKG_INSERT" },
      },
      {
        user: "{{user2}}",
        content: { text: "DKG INSERT" },
      },
    ],
  ] as ActionExample[][],
} as Action;
