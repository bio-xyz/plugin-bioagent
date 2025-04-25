// src/services/scaich/types.ts
export interface ScaiSearchResult {
  abstract: string;
  author: string;
  doi: string;
  location: string;
  referencecount: number;
  scihub_url: string;
  similarity: string;
  source: string;
  title: string;
  url: string;
  year: number;
}

export interface ScaiSummary {
  cot: string;
  sum: string;
}

export interface ScaiResponse {
  query: string;
  results: ScaiSearchResult[];
  summary: ScaiSummary;
}