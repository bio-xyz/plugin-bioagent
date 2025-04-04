// searchOntology.ts

import { logger } from "@elizaos/core";
import axios, { AxiosResponse } from "axios";
import "dotenv/config";
import { generateResponse } from "./anthropicClient";
import {
  get_go_api_prompt,
  get_doid_api_prompt,
  get_chebi_api_prompt,
  get_atc_api_prompt,
} from "./llmPrompt";
import Anthropic from "@anthropic-ai/sdk";

const bioontologyApiKey: string | undefined = process.env.BIONTOLOGY_KEY;

/**
 * Extract the last part of an ATC URL as the ATC ID.
 * E.g., if the URL ends with "/A12BC51", returns "A12BC51".
 */
export function extractAtcId(url: string): string | null {
  const match = url.match(/\/([^/]+)$/);
  return match ? match[1] : null;
}

/**
 * Search for a term in the Gene Ontology via QuickGO API.
 */
export async function searchGo(
  term: string,
  client: Anthropic,
  modelIdentifier: string = "claude-3-haiku-20240307"
): Promise<string> {
  const url = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/search";
  const params = { query: term, limit: 5, page: 1 };
  const headers = { Accept: "application/json" };

  let newTerm = "None";
  try {
    const apiResponse: AxiosResponse = await axios.get(url, {
      headers,
      params,
    });
    if (apiResponse.status === 200) {
      const goCandidates = apiResponse.data.results?.slice(0, 4) || [];
      const promptGoApi = get_go_api_prompt(term, goCandidates);

      newTerm = await generateResponse(client, promptGoApi, modelIdentifier);

      // Replace "GO:" with "GO_"
      if (newTerm.includes("GO:")) {
        newTerm = newTerm.replace("GO:", "GO_");
      }
      logger.info(`new term: ${newTerm}, old term: ${term}`);
    } else {
      logger.info(`EBI API gave response code ${apiResponse.status}`);
    }
  } catch (error) {
    logger.error(`Error generating response: ${error}`);
  }

  return newTerm;
}

/**
 * Search for a term in the DOID Ontology via EBI API.
 */
export async function searchDoid(
  term: string,
  client: Anthropic,
  modelIdentifier: string = "claude-3-haiku-20240307"
): Promise<string> {
  const url = "https://www.ebi.ac.uk/ols/api/search";
  const params = {
    q: term,
    ontology: "doid",
  };
  const headers = { Accept: "application/json" };

  let newTerm = "None";
  try {
    const apiResponse: AxiosResponse = await axios.get(url, {
      headers,
      params,
    });

    if (apiResponse.status === 200) {
      const data = apiResponse.data;
      const found = data.response?.numFound || 0;
      const doidCandidates =
        found > 0
          ? data.response.docs.slice(0, 4).map((candidate) => ({
              short_form: candidate.short_form,
              description: candidate.description,
              label: candidate.label,
            }))
          : [];

      const promptDoidApi = get_doid_api_prompt(term, doidCandidates);
      newTerm = await generateResponse(client, promptDoidApi, modelIdentifier);

      // Replace "DOID:" with "DOID_"
      if (newTerm.includes("DOID:")) {
        newTerm = newTerm.replace("DOID:", "DOID_");
      }
      logger.info(`new term: ${newTerm}, old term: ${term}`);
    } else {
      logger.error(`EBI API gave response code ${apiResponse.status}`);
    }
  } catch (error) {
    logger.error(`Error generating response: ${error}`);
  }

  return newTerm;
}

/**
 * Search for a term in the ChEBI Ontology via EBI API.
 */
export async function searchChebi(
  term: string,
  client: Anthropic,
  modelIdentifier: string = "claude-3-haiku-20240307"
): Promise<string> {
  const url = "https://www.ebi.ac.uk/ols/api/search";
  const params = {
    q: term,
    ontology: "chebi",
  };
  const headers = { Accept: "application/json" };

  let newTerm = "None";
  try {
    const apiResponse: AxiosResponse = await axios.get(url, {
      headers,
      params,
    });

    if (apiResponse.status === 200) {
      const data = apiResponse.data;
      const found = data.response?.numFound || 0;
      const chebiCandidates =
        found > 0
          ? data.response.docs.slice(0, 4).map((candidate) => ({
              short_form: candidate.short_form,
              description: candidate.description,
              label: candidate.label,
            }))
          : [];

      const promptChebiApi = get_chebi_api_prompt(term, chebiCandidates);
      newTerm = await generateResponse(client, promptChebiApi, modelIdentifier);

      // Replace "CHEBI:" with "CHEBI_"
      if (newTerm.includes("CHEBI:")) {
        newTerm = newTerm.replace("CHEBI:", "CHEBI_");
      }
      logger.info(`new term: ${newTerm}, old term: ${term}`);
    } else {
      logger.error(`EBI API gave response code ${apiResponse.status}`);
    }
  } catch (error) {
    logger.error(`Error generating response: ${error}`);
  }

  return newTerm;
}

/**
 * Search for a term in the ATC Ontology via BioOntology API.
 */
export async function searchAtc(
  term: string,
  client: Anthropic,
  modelIdentifier: string = "claude-3-haiku-20240307"
): Promise<string> {
  const url = "https://data.bioontology.org/search";
  const params = {
    q: term,
    ontologies: "ATC",
    apikey: bioontologyApiKey,
  };
  const headers = { Accept: "application/json" };

  let newTerm = "None";
  try {
    const apiResponse: AxiosResponse = await axios.get(url, {
      headers,
      params,
    });

    if (apiResponse.status === 200) {
      const data = apiResponse.data;
      let atcCandidates = [];
      if (data.collection && data.collection.length > 0) {
        atcCandidates = data.collection.map((candidate) => ({
          short_form: extractAtcId(candidate["@id"]),
          description: "",
          label: candidate["prefLabel"],
        }));
      }
      const promptAtcApi = get_atc_api_prompt(term, atcCandidates);
      newTerm = await generateResponse(client, promptAtcApi, modelIdentifier);

      logger.info(`new term: ${newTerm}, old term: ${term}`);
    } else {
      logger.error(`ATC API gave response code ${apiResponse.status}`);
    }
  } catch (error) {
    logger.error(`Error generating response: ${error}`);
  }

  return newTerm;
}

/**
 * Update subject and object fields in GO data with best-matching GO terms.
 */
export async function updateGoTerms(data, client: Anthropic) {
  for (const entry of data) {
    const subjectResult = await searchGo(entry.subject, client);
    entry.subject = { term: entry.subject, id: subjectResult };

    const objectResult = await searchGo(entry.object, client);
    entry.object = { term: entry.object, id: objectResult };
  }

  return data.filter(
    (entry) => entry.subject !== "None" && entry.object !== "None"
  );
}

/**
 * Update disease fields in DOID data with best-matching DOID terms.
 */
export async function updateDoidTerms(data, client: Anthropic) {
  for (const entry of data) {
    const diseaseResult = await searchDoid(entry.disease, client);
    entry.disease_id = diseaseResult;
  }

  return data.filter((entry) => entry.disease_id !== "None");
}

/**
 * Update compound fields in ChEBI data with best-matching ChEBI terms.
 */
export async function updateChebiTerms(data, client: Anthropic) {
  for (const entry of data) {
    const compoundResult = await searchChebi(entry.compound, client);
    entry.compound_id = compoundResult;
  }

  return data.filter((entry) => entry.compound_id !== "None");
}

/**
 * Update drug fields in ATC data with best-matching ATC terms.
 */
export async function updateAtcTerms(data, client: Anthropic) {
  for (const entry of data) {
    const drugResult = await searchAtc(entry.drug, client);
    entry.drug_id = drugResult;
  }

  return data.filter((entry) => entry.drug_id !== "None");
}
