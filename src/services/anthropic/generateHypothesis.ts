import fs from "fs/promises";
import { splitMarkdownForDiscord } from "./discordSplitter";
import {
  chooseTwoRelevantFindings,
  chooseTwoRelevantKeywords,
} from "./chooseTwoRelevant";
import { Binding, Abstract, Finding, FindingResult, Hypothesis } from "./types";
import { sparqlRequest } from "./sparql/makeRequest";
import { FileError, SparqlError } from "./errors";
import { anthropic } from "./client";
import { logger, IAgentRuntime } from "@elizaos/core";
import {
  getKeywordsQuery,
  getAbstractsQuery,
  getFindingsQuery,
  getAbstractsForPapersQuery,
  getPreviousHypothesesForKeywordsQuery,
} from "./sparql/queries";
/**
 * Loads a SPARQL query from a file
 * @param path Path to the query file
 * @returns The query as a string
 */
export async function loadQuery(path: string): Promise<string> {
  try {
    return await fs.readFile(path, "utf8");
  } catch (error) {
    throw new FileError(`Failed to load query from ${path}`, error);
  }
}

/**
 * Fetches keywords from the graph database
 */
async function fetchKeywords(): Promise<string[]> {
  const data = await sparqlRequest(getKeywordsQuery);
  return data.results.bindings.map((binding: Binding) => binding.obj.value);
}

/**
 * Fetches previous hypotheses for an array of keywords
 */
async function fetchPreviousHypotheses(keywords: string[]): Promise<string[]> {
  const data = await sparqlRequest(
    getPreviousHypothesesForKeywordsQuery(keywords)
  );
  return data.results.bindings.map(
    (binding: Hypothesis) => binding.hypothesis.value
  );
}

/**
 * Fetches abstracts for a given keyword
 */
async function fetchAbstracts(
  keyword: string
): Promise<{ abstract: string; paper: string }[]> {
  const data = await sparqlRequest(
    getAbstractsQuery.replace("{{keyword}}", `"${keyword}"`)
  );
  return data.results.bindings.map((binding: Abstract) => ({
    abstract: binding.abstract.value,
    paper: binding.sub.value,
  }));
}

/**
 * Fetches findings from the graph database
 */
async function fetchFindings(): Promise<FindingResult[]> {
  const data = await sparqlRequest(getFindingsQuery);
  return data.results.bindings.map((binding: Finding) => ({
    finding: binding.description.value,
    paper: binding.paper.value,
  }));
}

/**
 * Fetches abstracts for list of papers
 */
async function fetchAbstractsForPapers(papers: string[]): Promise<string[]> {
  const data = await sparqlRequest(getAbstractsForPapersQuery(papers));
  return data.results.bindings.map(
    (binding: Abstract) => binding.abstract.value
  );
}

/**
 * Ensures the chosen keywords are in array format
 */
function ensureKeywordsArray(chosen: string | string[]): string[] {
  if (Array.isArray(chosen)) {
    return chosen;
  }

  return chosen
    .slice(1, -1) // Remove brackets
    .split(",")
    .map((s) => s.trim());
}

/**
 * Ensures the chosen keywords are in array format
 */
function ensureFindingsArray(chosen: string | string[]): string[] {
  if (Array.isArray(chosen)) {
    return chosen;
  }

  return chosen
    .slice(1, -1) // Remove brackets
    .split(";;;")
    .map((s) => s.trim());
}

/**
 * Creates a hypothesis generation prompt
 */
function createHypothesisPrompt(
  findings: string[],
  keywords: string[],
  abstractsFindings: string[],
  abstractKeywords: string[],
  previousHypotheses: string[]
): string {
  return `
You are a biomedical scientist specializing in generating novel, testable hypotheses that connect seemingly disparate research areas.

## Task
Develop a mechanistic hypothesis that connects findings ${findings[0]} and ${
    findings[1]
  } through specific biological pathways, molecular mechanisms, or cellular processes that could plausibly link these fields.

## Hypothesis Structure
1. Background: Briefly summarize the current state of knowledge for each topic (2-3 sentences per topic)
2. Knowledge Gap: Identify a specific gap in understanding that your hypothesis addresses
3. Central Hypothesis: Clearly state your proposed mechanistic connection in one concise sentence
4. Proposed Mechanism: Detail the step-by-step biological pathway or mechanism (3-5 steps)
5. Testable Predictions: Provide 2-3 specific, falsifiable predictions that would validate your hypothesis
6. Potential Experimental Approaches: Suggest 1-2 experimental methods to test your hypothesis

## Evaluation Criteria
- Novelty: Prioritize non-obvious connections that aren't explicitly stated in the abstracts
- Biological Plausibility: Ensure the mechanism adheres to known biological principles
- Parsimony: Favor simpler explanations that require fewer assumptions
- Falsifiability: Ensure the hypothesis can be tested and potentially disproven

## Research Abstracts for the findings:
${abstractsFindings
  .map((abstract, index) => `Abstract ${index + 1}:\n${abstract}`)
  .join("\n\n")}

## Relevant keywords to the findings:
${keywords.join(", ")}

## Research Abstracts for the keywords relevant to the findings:
${abstractKeywords
  .map((abstract, index) => `Abstract ${index + 1}:\n${abstract}`)
  .join("\n\n")}

## Previous Hypotheses for the relevant keywords:
${
  previousHypotheses.length
    ? previousHypotheses
        .map((hypothesis, index) => `Hypothesis ${index + 1}:\n${hypothesis}`)
        .join("\n\n")
    : "There are no previous hypotheses."
}

## Additional Guidelines
- Cite specific abstracts when drawing information (e.g., "As shown in Abstract 3...")
- Acknowledge conflicting evidence if present in the abstracts
- Consider alternative mechanisms if multiple plausible pathways exist
- Focus on mechanisms that could reasonably be investigated with current technology
  `.trim();
}

/**
 * Generates a hypothesis connecting two randomly chosen keywords
 */
export async function generateHypothesis(
  agentRuntime: IAgentRuntime
): Promise<{ hypothesis: string; hypothesisMessageId: string }> {
  const channel = await agentRuntime
    .getService("discord")
    // @ts-ignore
    .client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
  logger.info("Generating hypothesis...");
  try {
    // Fetch and choose findings
    const findings = await fetchFindings();
    const chosen = await chooseTwoRelevantFindings(
      findings.map((f) => f.finding)
    );
    const chosenFindings = ensureFindingsArray(chosen);
    logger.info("Chosen findings:", chosenFindings);

    // TODO: more ideal to get both the paper and the finding from the LLM prompt rather than searching like this
    const findingPapers = findings
      .filter((f) => chosenFindings.includes(f.finding))
      .map((f) => f.paper);

    const abstracts = await fetchAbstractsForPapers(findingPapers);

    logger.info("Abstracts:", abstracts);

    // makes sense to use both old keyword search + the finding search and combine the results
    // Some papers are in new form with BIO ontologies, and some are in old format with regular keywords
    // imo best way to do this in the future is to add the keywords to the BIO ontology format, since it looks like a useful way to search
    // then first the keywords could be used to filter the papers, and then the findings could be used for actual hypotheses
    // since im doing the task timeboxed for 1 day, im going to implement in the following way:

    // for now, let's use the other papers which are in the other format to extract additional information from the abstracts
    // let's get two relevant keywords, that are connected to the selected findings
    const keywords = await fetchKeywords();

    const keywordsString = await chooseTwoRelevantKeywords(
      keywords,
      chosenFindings
    );
    logger.info("Keywords:", keywordsString);
    const chosenKeywords = ensureKeywordsArray(keywordsString);
    logger.info("Chosen keywords:", chosenKeywords);

    // get additional abstracts for the hypotheses generation (sourcing from minimum 4 papers instead of 2)
    const abstractsKeywordOne = await fetchAbstracts(chosenKeywords[0]);
    const abstractsKeywordTwo = await fetchAbstracts(chosenKeywords[1]);

    // combine the abstracts from the findings and the keywords
    const keywordAbstractsResult = [
      ...abstractsKeywordOne,
      ...abstractsKeywordTwo,
    ];
    const keywordAbstracts = keywordAbstractsResult.map((a) => a.abstract);
    const keywordPapers = keywordAbstractsResult.map((a) => a.paper);
    const usedPapers = [...new Set([...findingPapers, ...keywordPapers])];
    const usedAbstracts = [
      ...abstracts,
      ...keywordAbstractsResult.map((a) => a.abstract),
    ];

    const previousHypotheses = await fetchPreviousHypotheses(chosenKeywords);
    logger.info("Previous hypotheses:", previousHypotheses);

    const hypothesisGenerationPrompt = createHypothesisPrompt(
      chosenFindings,
      chosenKeywords,
      abstracts,
      keywordAbstracts,
      previousHypotheses
    );

    logger.info("Generating hypothesis...");
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-latest",
      messages: [{ role: "user", content: hypothesisGenerationPrompt }],
      max_tokens: 5001,
      thinking: {
        type: "enabled",
        budget_tokens: 5000,
      },
    });

    const hypothesis =
      response.content[1]?.type === "text"
        ? response.content[1].text
        : "No hypothesis generated";

    logger.info("Generated Hypothesis:");
    logger.info(hypothesis);
    logger.info(
      "For verifiability, here are the papers to cross check the hypotheses:"
    );
    logger.info(usedPapers);

    const randomId = Math.random().toString(36).substring(2, 15);

    // produce a hypothesis, citing the papers that were used to generate it, as well as the concrete findings and keywords
    const hypothesisJSONLD = {
      "@context": {
        dcterms: "http://purl.org/dc/terms/",
        cito: "http://purl.org/spar/cito/",
        deo: "http://purl.org/spar/deo/",
      },
      "@id": `https://hypothesis.bioagent.ai/${randomId}`,
      "@type": "deo:FutureWork",
      "cito:usesDataFrom": usedPapers,
      "dcterms:references": [hypothesis],
      "dcterms:subject": chosenKeywords,
      "dcterms:source": chosenFindings,
      "dcterms:abstract": usedAbstracts,
    };

    const chunks = await splitMarkdownForDiscord(hypothesis);
    const messageIds = [];
    for (const chunk of chunks) {
      const message = await channel.send(chunk.content);
      messageIds.push(message.id);
    }
    return { hypothesis, hypothesisMessageId: messageIds[0] }; // return the first message id, which is the hypothesis heading
  } catch (error) {
    if (error instanceof SparqlError) {
      console.error("SPARQL Error:", error.message);
    } else if (error instanceof FileError) {
      console.error("File Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}
