// src/services/scaich/client.ts
import axios from "axios";
import { logger } from "@elizaos/core";

const SCAI_API_URL = "https://api.scai.sh/search";

/**
 * Sends a search query to the SCAI API and returns the response.
 * @param query - The search query string
 * @param limit - Maximum number of results to return
 * @param oa - Whether to restrict to open access articles
 * @returns The API response data
 */
export async function searchLiterature(
  query: string,
  limit: number = 10,
  oa: boolean = false
): Promise<any> {
  try {
    const response = await axios.get(SCAI_API_URL, {
      params: { query, limit, oa },
      timeout: 10000, // 10 seconds timeout
    });
    logger.info(`SCAI API request successful for query: ${query}`);
    return response.data;
  } catch (error) {
    logger.error(`SCAI API request failed: ${error.message}`);
    throw error;
  }
}