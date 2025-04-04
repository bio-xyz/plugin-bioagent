// vectorize.ts

import { get_prompt_vectorization_summary } from "./llmPrompt"; // Adjust path as needed
import { generateResponse } from "./anthropicClient"; // Adjust path as needed
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "@elizaos/core";

/**
 * The general structure of your graph object. Extend with any additional fields you need.
 */
interface Graph {
  [key: string]: unknown;
  "dcterms:title"?: string;
  "@id"?: string;
}

/**
 * A single citation entry. Adjust if your citation objects have more fields.
 */
interface CitationEntry {
  [key: string]: unknown;
  "@id": string;
  "dcterms:title": string;
}

/**
 * The shape returned by findSimilarTitle. The second element is a similarity score (0-1).
 * The first element's metadata presumably includes a "doi" string.
 */
interface SimilarCitationResult {
  metadata: { [key: string]: string };
}

/**
 * Generate a summary for the provided graph using the LLM client.
 * @param client - The client or config object for your LLM
 * @param graph  - The graph/dictionary containing paper metadata
 */
export async function getSummary(
  client: Anthropic,
  graph: Graph
): Promise<string> {
  let summary = "";
  try {
    const prompt = get_prompt_vectorization_summary(graph);
    summary = await generateResponse(client, prompt);
    logger.info(`Generated graph summary from Claude: ${summary}`);
  } catch (error) {
    logger.error("Generated graph summary exception", error);
    summary = "";
  }
  return summary;
}
