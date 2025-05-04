// src/services/scaich/processResults.ts
import { ScaiResponse, ScaiSearchResult } from "./types";
import { logger } from "@elizaos/core";
import { storeJsonLd } from "../gdrive/storeJsonLdToKg"; // 重用现有存储逻辑

/**
 * Converts SCAI search results to JSON-LD and stores them in the knowledge graph.
 * @param response - The SCAI API response
 * @returns The generated JSON-LD graph
 */
export async function processScaiResults(response: ScaiResponse): Promise<Record<string, any>> {
  const jsonLdGraph: Record<string, any> = {
    "@context": "http://schema.org",
    "@type": "ScholarlyArticle",
    "query": response.query,
    "articles": [],
  };

  for (const result of response.results) {
    const article = {
      "@id": result.doi,
      "@type": "ScholarlyArticle",
      "name": result.title,
      "abstract": result.abstract,
      "author": result.author.split(", ").map((name) => ({ "@type": "Person", "name": name })),
      "url": result.url,
      "sameAs": result.scihub_url,
      "datePublished": result.year.toString(),
      "identifier": result.doi,
      "keywords": response.summary.sum.split(", "),
    };
    jsonLdGraph.articles.push(article);
  }

  try {
    // 存储到知识图谱
    const success = await storeJsonLd(jsonLdGraph);
    if (success) {
      logger.info(`Successfully stored SCAI search results for query: ${response.query}`);
    } else {
      logger.error("Failed to store JSON-LD to knowledge graph");
    }
  } catch (error) {
    logger.error(`Error storing JSON-LD: ${error.message}`);
  }

  return jsonLdGraph;
}