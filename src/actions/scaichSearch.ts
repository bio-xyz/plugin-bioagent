// src/actions/scaichSearch.ts
import { searchLiterature } from "../services/scaich/client";
import { processScaiResults } from "../services/scaich/processResults";
import { logger } from "@elizaos/core";

export const SCAI_SEARCH_ACTION = "SCAI_SEARCH";

export const scaichSearch = {
  name: SCAI_SEARCH_ACTION,
  description: "Search scientific literature using the SCAI API",
  validate: async () => {
    // 移除 SCAI_API_KEY 检查，因为 API 不需要认证
    return { valid: true };
  },
  handler: async ({ message, runtime }) => {
    const query = message.content.trim();
    if (!query) {
      return { response: "Please provide a search query" };
    }

    try {
      const response = await searchLiterature(query, 10, false);
      const jsonLdGraph = await processScaiResults(response);
      return {
        response: `Found ${response.results.length} articles for query "${query}". Results stored in knowledge graph.`,
        data: jsonLdGraph,
      };
    } catch (error) {
      logger.error(`SCAI search failed: ${error.message}`);
      return { response: `Error searching literature: ${error.message}` };
    }
  },
};