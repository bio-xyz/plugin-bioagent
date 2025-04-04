import {
  get_prompt_basic_info,
  get_prompt_citations,
  get_prompt_go_subgraph,
  get_prompt_doid_subgraph,
  get_prompt_chebi_subgraph,
  get_prompt_atc_subgraph,
  get_prompt_spar_ontology,
  get_prompt_spar_citations,
  get_prompt_section_page_numbers,
  get_prompt_go_ontology,
  get_prompt_suggested_questions,
} from "./llmPrompt";

import { generateResponse, getClient } from "./anthropicClient";
import {
  updateGoTerms,
  updateDoidTerms,
  updateChebiTerms,
  updateAtcTerms,
} from "./biologyApi";

import { extractBracketContent, isEmptyArray } from "./regex";
import { logger } from "@elizaos/core";
import Anthropic from "@anthropic-ai/sdk";

/** Generic JSON-like type for representing arbitrary structures. */
type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | JSONValue[];

/** One page's text and metadata. */
interface PaperArrayElement {
  metadata: {
    page_number: number;
  };
  text: string;
}

/** Object storing arrays of text for each major section. */
interface PaperDict {
  introduction: string[];
  abstract: string[];
  methods: string[];
  results: string[];
  discussion: string[];
  citations: string[];
}

/** Key-value for label => [startPage, endPage]. */
interface LabelPageRanges {
  [label: string]: [number, number];
}

/** Subgraph object typically returned from the extraction steps. */
interface SubgraphSet {
  go: string;
  doid: string;
  chebi: string;
  atc: string;
}

/** Result of processPaper: a 6-tuple of strings. */
type PaperProcessResult = [string, string, string, string, string, string];

const CITATIONS_OFFSET = 6;

/**
 * Extract page ranges for known sections (Abstract, Introduction, Methods, etc.).
 */
export async function extractSections(
  client: Anthropic,
  paper_array: PaperArrayElement[]
): Promise<LabelPageRanges> {
  const originalLabels = [
    "Abstract",
    "Introduction",
    "Methods",
    "Materials and methods",
    "Material and methods",
    "Results",
    "Discussion",
  ];

  const labels = originalLabels.map((label) => label.toLowerCase());
  const label_page_numbers: Record<string, number[]> = {};
  const label_mapping: Record<string, string> = {};

  for (const label of labels) {
    label_page_numbers[label] = [];
    const originalLabel = originalLabels.find(
      (orig) => orig.toLowerCase() === label
    );
    label_mapping[label] = originalLabel ? originalLabel : label;
  }

  for (const element of paper_array) {
    const page_number = element.metadata.page_number;
    const textLower = element.text.toLowerCase();

    for (const label of labels) {
      if (textLower.includes(label)) {
        // Skip table of contents on page 1 for all but "Abstract" and "Introduction"
        if (
          page_number === 1 &&
          label !== "abstract" &&
          label !== "introduction"
        ) {
          continue;
        }
        label_page_numbers[label].push(page_number);
      }
    }
  }

  // If "methods" array is empty, try "materials and methods" or "material and methods"
  const methodAliases = ["materials and methods", "material and methods"];
  if (label_page_numbers["methods"].length === 0) {
    for (const alias of methodAliases) {
      if (label_page_numbers[alias] && label_page_numbers[alias].length > 0) {
        label_page_numbers["methods"] = label_page_numbers[alias];
        break;
      }
    }
  }

  // Remove the separate method aliases from the dictionary
  for (const alias of methodAliases) {
    if (alias in label_page_numbers) {
      delete label_page_numbers[alias];
      const idx = labels.indexOf(alias);
      if (idx >= 0) {
        labels.splice(idx, 1);
      }
      const origAlias = label_mapping[alias];
      const origAliasIdx = originalLabels.indexOf(origAlias);
      if (origAliasIdx >= 0) {
        originalLabels.splice(origAliasIdx, 1);
      }
    }
  }

  // Map each label => first page or undefined
  const first_appearance: Record<string, number | undefined> = {};
  for (const [label, pages] of Object.entries(label_page_numbers)) {
    first_appearance[label] = pages.length > 0 ? pages[0] : undefined;
  }
  // Remove undefined
  for (const key of Object.keys(first_appearance)) {
    if (first_appearance[key] === undefined) {
      delete first_appearance[key];
    }
  }

  const sorted_labels = Object.entries(first_appearance).sort((a, b) => {
    const aVal = a[1] === undefined ? Infinity : a[1];
    const bVal = b[1] === undefined ? Infinity : b[1];
    return (aVal as number) - (bVal as number);
  });

  const label_page_ranges: LabelPageRanges = {};

  // Build up the start/stop pages for each discovered label
  for (let i = 0; i < sorted_labels.length; i++) {
    const [label, startPageRaw] = sorted_labels[i];
    if (startPageRaw == null) continue;
    let start_page = startPageRaw;
    let end_page: number;

    // If first label, set to page 1
    if (i === 0) {
      start_page = 1;
    }

    // If last label => end on final page
    if (i === sorted_labels.length - 1) {
      end_page = paper_array[paper_array.length - 1].metadata.page_number;
    } else {
      const [_, nextStart] = sorted_labels[i + 1];
      if (nextStart != null && nextStart >= start_page) {
        end_page = nextStart;
      } else {
        end_page = start_page;
      }
    }
    label_page_ranges[label] = [start_page, end_page];
  }

  // Some labels not found => request pages from the LLM
  const labels_with_no_range: string[] = labels.filter(
    (label) => !(label in label_page_ranges)
  );

  if (labels_with_no_range.length > 0) {
    const prompt = get_prompt_section_page_numbers(
      paper_array.map((el) => ({
        metadata: { page_number: el.metadata.page_number },
        text: el.text,
      })),
      labels_with_no_range.map((lbl) => label_mapping[lbl])
    );

    const answer = await generateResponse(
      client,
      prompt,
      "claude-3-5-sonnet-20241022",
      8192
    );

    const answerLines = answer.split("\n");

    const additional_label_page_ranges: LabelPageRanges = {};

    for (const line of answerLines) {
      // e.g. "Introduction, 2, 5"
      const match = line.trim().match(/^(\w+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const labelLower = match[1].toLowerCase();
        const startPage = parseInt(match[2], 10);
        const endPage = parseInt(match[3], 10);
        additional_label_page_ranges[labelLower] = [startPage, endPage];
      }
    }

    // Merge additional ranges in
    for (const [label, range] of Object.entries(additional_label_page_ranges)) {
      label_page_ranges[label] = range;
    }
  }

  // Build final list of extracted labels
  const extractedLabels = Object.keys(label_page_ranges)
    .map((lbl) => label_mapping[lbl])
    .filter((lbl2) => lbl2 != null);

  const skippedLabels = originalLabels.filter(
    (lbl) => !extractedLabels.includes(lbl)
  );

  if (skippedLabels.length > 0) {
    logger.info(`Skipped sections: ${skippedLabels.join(", ")}`);
  } else {
    logger.info(`All sections were extracted.`, label_page_ranges);
  }

  // Make introduction start at page 0 if it exists
  if ("introduction" in label_page_ranges) {
    const [_, endPage] = label_page_ranges["introduction"];
    label_page_ranges["introduction"] = [0, endPage];
  }

  return label_page_ranges;
}

/**
 * Return a string containing basic info about the paper, or "" on error.
 */
export async function getGeneratedBasicInfoText(
  client: Anthropic,
  paper_dict: PaperDict
): Promise<string> {
  const spar_array = Array.from(
    new Set([...paper_dict.introduction, ...paper_dict.abstract])
  );
  try {
    const prompt_basic_info = get_prompt_basic_info(spar_array);
    const generated_basic_info_text = await generateResponse(
      client,
      prompt_basic_info
    );
    logger.info(
      `Generated basic text from Claude: ${generated_basic_info_text}`
    );
    return generated_basic_info_text;
  } catch (e) {
    logger.error("Generated basic info text exception", e);
    return "";
  }
}

/**
 * Return a string containing citations, or "" on error.
 */
export async function getGeneratedCitations(
  client: Anthropic,
  paper_dict: PaperDict
): Promise<string> {
  try {
    const prompt_citations = get_prompt_citations(paper_dict.citations);
    const generated_citations = await generateResponse(
      client,
      prompt_citations,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger.info(`Generated citations from Claude: ${generated_citations}`);
    return generated_citations;
  } catch (e) {
    logger.error("Generated citations exception", e);
    return "";
  }
}

/**
 * Generate a GO subgraph from relevant sections, then refine it via update_go_terms.
 */
export async function getGoGeneratedSubgraphText(
  client: Anthropic,
  paper_dict: PaperDict
): Promise<string> {
  try {
    const go_array = Array.from(
      new Set([
        ...paper_dict.introduction,
        ...paper_dict.methods,
        ...paper_dict.results,
        ...paper_dict.discussion,
      ])
    );
    const prompt_subgraph = get_prompt_go_subgraph(go_array);
    let generated_subgraph_text = await generateResponse(
      client,
      prompt_subgraph,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger.info(
      `Generated GO subgraph from Claude: ${generated_subgraph_text}`
    );

    let generated_subgraph: JSONValue;
    try {
      generated_subgraph = JSON.parse(generated_subgraph_text) as JSONValue;
    } catch {
      generated_subgraph = {};
    }

    // The below function presumably returns a new structure or modifies in place:
    const updated_subgraph = await updateGoTerms(generated_subgraph, client);
    generated_subgraph_text = JSON.stringify(updated_subgraph);
    logger.info(`Generated subgraph using GO API: ${generated_subgraph_text}`);
    return generated_subgraph_text;
  } catch (e) {
    logger.error("Generated subgraph exception", e);
    return "{}";
  }
}

/**
 * Generate a DOID subgraph from relevant sections, then refine it via update_doid_terms.
 */
export async function getDoidGeneratedSubgraphText(
  client: Anthropic,
  paper_dict: PaperDict
): Promise<string> {
  try {
    const doid_array = Array.from(
      new Set([
        ...paper_dict.introduction,
        ...paper_dict.abstract,
        ...paper_dict.results,
        ...paper_dict.discussion,
      ])
    );
    const prompt_subgraph = get_prompt_doid_subgraph(doid_array);
    const generated_subgraph_text = await generateResponse(
      client,
      prompt_subgraph,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger.info(
      `Generated DOID subgraph from Claude: ${generated_subgraph_text}`
    );

    let generated_subgraph: JSONValue;
    try {
      generated_subgraph = JSON.parse(generated_subgraph_text) as JSONValue;
    } catch {
      generated_subgraph = [];
    }
    const updated_subgraph = await updateDoidTerms(generated_subgraph, client);
    const finalText = JSON.stringify(updated_subgraph);
    logger.info(`Generated subgraph using DOID API: ${finalText}`);
    return finalText;
  } catch (e) {
    logger.error("Generated subgraph exception", e);
    return "[]";
  }
}

/**
 * Generate a ChEBI subgraph from relevant sections, then refine it via update_chebi_terms.
 */
export async function getChebiGeneratedSubgraphText(
  client: Anthropic,
  paper_dict: PaperDict
): Promise<string> {
  try {
    const chebi_array = Array.from(
      new Set([
        ...paper_dict.introduction,
        ...paper_dict.abstract,
        ...paper_dict.results,
        ...paper_dict.discussion,
      ])
    );
    const prompt_subgraph = get_prompt_chebi_subgraph(chebi_array);
    const generated_subgraph_text = await generateResponse(
      client,
      prompt_subgraph,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger.info(
      `Generated ChEBI subgraph from Claude: ${generated_subgraph_text}`
    );

    let generated_subgraph: JSONValue;
    try {
      generated_subgraph = JSON.parse(generated_subgraph_text) as JSONValue;
    } catch {
      generated_subgraph = [];
    }
    const updated_subgraph = await updateChebiTerms(generated_subgraph, client);
    const finalText = JSON.stringify(updated_subgraph);
    logger.info(`Generated subgraph using CHEBI API: ${finalText}`);
    return finalText;
  } catch (e) {
    logger.error("Generated subgraph exception", e);
    return "[]";
  }
}

/**
 * Generate an ATC subgraph from relevant sections, then refine it via update_atc_terms.
 */
export async function getAtcGeneratedSubgraphText(
  client: Anthropic,
  paper_dict: PaperDict
): Promise<string> {
  try {
    const atc_array = Array.from(
      new Set([
        ...paper_dict.introduction,
        ...paper_dict.abstract,
        ...paper_dict.results,
        ...paper_dict.discussion,
      ])
    );
    const prompt_subgraph = get_prompt_atc_subgraph(atc_array);
    const generated_subgraph_text = await generateResponse(
      client,
      prompt_subgraph,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger.info(
      `Generated ATC subgraph from Claude: ${generated_subgraph_text}`
    );

    let generated_subgraph: JSONValue;
    try {
      generated_subgraph = JSON.parse(generated_subgraph_text) as JSONValue;
    } catch {
      generated_subgraph = [];
    }
    const updated_subgraph = await updateAtcTerms(generated_subgraph, client);
    const finalText = JSON.stringify(updated_subgraph);
    logger.info(`Generated subgraph using ATC API: ${finalText}`);
    return finalText;
  } catch (e) {
    logger.error("Generated subgraph exception", e);
    return "[]";
  }
}

/**
 * Launch parallel tasks to produce each piece of data from a single paper.
 */
export async function process_paper(
  client: Anthropic,
  paper_dict: PaperDict
): Promise<PaperProcessResult> {
  const [
    generated_basic_info,
    generated_citations,
    generated_go_subgraph,
    generated_doid_subgraph,
    generated_chebi_subgraph,
    generated_atc_subgraph,
  ] = await Promise.all([
    getGeneratedBasicInfoText(client, paper_dict),
    getGeneratedCitations(client, paper_dict),
    getGoGeneratedSubgraphText(client, paper_dict),
    getDoidGeneratedSubgraphText(client, paper_dict),
    getChebiGeneratedSubgraphText(client, paper_dict),
    getAtcGeneratedSubgraphText(client, paper_dict),
  ]);

  return [
    generated_basic_info,
    generated_citations,
    generated_go_subgraph,
    generated_doid_subgraph,
    generated_chebi_subgraph,
    generated_atc_subgraph,
  ];
}

/**
 * Truncates a JSON array string at the last valid element, then closes the array.
 */
export function fix_json_string_manually(json_string: string): string {
  const lastBraceIndex = json_string.lastIndexOf("},");
  if (lastBraceIndex !== -1) {
    json_string = json_string.slice(0, lastBraceIndex + 1);
  }

  if (json_string.endsWith(",")) {
    json_string = json_string.slice(0, -1);
  }

  return json_string + "]";
}

/**
 * Convert freeform citations text into a JSON-LD array (SPAR citations).
 */
export async function get_subgraph_citations(
  client: Anthropic,
  citations_text: string
): Promise<JSONValue> {
  const prompt_spar_citations = get_prompt_spar_citations(citations_text);
  const generated_citations_spar_text = await generateResponse(
    client,
    prompt_spar_citations,
    "claude-3-5-sonnet-20241022",
    8192
  );
  logger.info(
    `Generated SPAR citations from Claude: ${generated_citations_spar_text}`
  );

  try {
    return JSON.parse(generated_citations_spar_text) as JSONValue;
  } catch {
    const fixed_citations = fix_json_string_manually(
      generated_citations_spar_text
    );
    logger.info(`Fixed citations: ${fixed_citations}`);
    return JSON.parse(fixed_citations) as JSONValue;
  }
}

/**
 * Use SPAR+OBI ontology prompt to convert basic info text into JSON-LD.
 */
export async function get_subgraph_basic_info(
  client: Anthropic,
  basic_info_text: string
): Promise<string> {
  if (isEmptyArray(basic_info_text)) {
    return basic_info_text;
  }

  const prompt_spar_ontology_ = get_prompt_spar_ontology(basic_info_text);
  const generated_graph_text = await generateResponse(
    client,
    prompt_spar_ontology_,
    "claude-3-5-sonnet-20241022",
    8192
  );
  logger.info(`Generated SPAR graph from Claude: ${generated_graph_text}`);

  let textTrimmed = generated_graph_text.trim();
  if (textTrimmed.startsWith("```json") && textTrimmed.endsWith("```")) {
    textTrimmed = textTrimmed.slice(7, -3).trim();
  }
  return textTrimmed;
}

/**
 * Convert a GO subgraph from raw JSON to an ontology array (JSON-LD).
 */
export async function get_subgraph_go(
  client: Anthropic,
  generated_go_subgraph: string
): Promise<JSONValue> {
  try {
    if (isEmptyArray(generated_go_subgraph)) {
      return [];
    }
    const prompt_go_ontology_ = get_prompt_go_ontology(generated_go_subgraph);
    const generated_graph_text = await generateResponse(
      client,
      prompt_go_ontology_,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger.info(`Generated GO subgraph from Claude: ${generated_graph_text}`);

    const extracted_content = extractBracketContent(generated_graph_text);
    if (extracted_content === null) {
      return [];
    }
    return JSON.parse(extracted_content);
  } catch (e) {
    logger.error("Error generating GO subgraph", e);
    return [];
  }
}

/**
 * Convert the DOID subgraph from raw JSON to RDF.
 */
export function get_subgraph_doid(generated_doid_subgraph: string): JSONValue {
  try {
    const doidData = JSON.parse(generated_doid_subgraph);
    if (!Array.isArray(doidData)) return [];

    const rdf = doidData.map((item: Record<string, JSONValue>) => ({
      "@id": `http://purl.obolibrary.org/obo/${item["disease_id"]}`,
      "dcterms:title": item["disease"],
      "dcterms:description": item["findings"],
    }));
    return rdf;
  } catch (e) {
    logger.error("Error generating DOID subgraph", e);
    return [];
  }
}

/**
 * Convert the CHEBI subgraph from raw JSON to RDF.
 */
export function get_subgraph_chebi(
  generated_chebi_subgraph: string
): JSONValue {
  try {
    const chebiData = JSON.parse(generated_chebi_subgraph);
    if (!Array.isArray(chebiData)) return [];

    const rdf = chebiData.map((item: Record<string, JSONValue>) => ({
      "@id": `http://purl.obolibrary.org/obo/${item["compound_id"]}`,
      "dcterms:title": item["compound"],
      "dcterms:description": item["findings"],
    }));
    return rdf;
  } catch (e) {
    logger.error("Error generating CHEBI subgraph", e);
    return [];
  }
}

/**
 * Convert the ATC subgraph from raw JSON to RDF.
 */
export function get_subgraph_atc(generated_atc_subgraph: string): JSONValue {
  try {
    const atcData = JSON.parse(generated_atc_subgraph);
    if (!Array.isArray(atcData)) return [];

    const rdf = atcData.map((item: Record<string, JSONValue>) => ({
      "@id": `http://purl.bioontology.org/ontology/ATC/${item["drug_id"]}`,
      "dcterms:title": item["drug"],
      "dcterms:description": item["findings"],
    }));
    return rdf;
  } catch (e) {
    logger.error("Error generating ATC subgraph", e);
    return [];
  }
}

/**
 * Build a final combined JSON-LD-like graph from basic info, citations, and subgraphs.
 */
export async function create_graph(
  client: Anthropic,
  basic_info_text: string,
  citations_text: string,
  subgraph: SubgraphSet
): Promise<Record<string, JSONValue>> {
  const { go, doid, chebi, atc } = subgraph;

  let generated_graph: Record<string, JSONValue> = {};

  try {
    const generated_graph_text = await get_subgraph_basic_info(
      client,
      basic_info_text
    );
    generated_graph = JSON.parse(generated_graph_text) as Record<
      string,
      JSONValue
    >;
  } catch (e) {
    logger.error("Generating graph exception", e);
  }

  // Ensure the array is in place
  if (!generated_graph["obi:OBI_0000299"]) {
    generated_graph["obi:OBI_0000299"] = [];
  }

  // Merge subgraphs
  const goArray = await get_subgraph_go(client, go);
  const doidArray = get_subgraph_doid(doid);
  const chebiArray = get_subgraph_chebi(chebi);
  const atcArray = get_subgraph_atc(atc);

  // We know "obi:OBI_0000299" must be an array
  const obiArr = generated_graph["obi:OBI_0000299"];
  if (Array.isArray(obiArr)) {
    if (Array.isArray(goArray)) obiArr.push(...goArray);
    if (Array.isArray(doidArray)) obiArr.push(...doidArray);
    if (Array.isArray(chebiArray)) obiArr.push(...chebiArray);
    if (Array.isArray(atcArray)) obiArr.push(...atcArray);
  }

  try {
    const subgraphCites = await get_subgraph_citations(client, citations_text);
    generated_graph["cito:cites"] = subgraphCites;
  } catch (e) {
    logger.error("Error generating citations", e);
  }

  // If we have a valid DOI, set @id
  const doi = generated_graph["dcterms:identifier"];
  if (doi && doi !== "https://doi.org/XX.XXXX/XX.XXXX") {
    generated_graph["@id"] = doi;
  } else {
    generated_graph["@id"] = "PLEASE FILL IN THE DOI URL IDENTIFIER HERE";
  }

  return generated_graph;
}

/**
 * Create arrays of text for each recognized section.
 */
export function create_section_arrays(
  paper_array: PaperArrayElement[],
  section_ranges: LabelPageRanges
): PaperDict {
  const introduction_array: string[] = [];
  const abstract_array: string[] = [];
  const methods_array: string[] = [];
  const results_array: string[] = [];
  const discussion_array: string[] = [];

  for (const element of paper_array) {
    const page_number = element.metadata.page_number;
    const text = element.text;

    // Introduction
    if (
      "introduction" in section_ranges &&
      page_number >= section_ranges["introduction"][0] &&
      page_number <= section_ranges["introduction"][1]
    ) {
      introduction_array.push(text);
    }
    // Abstract
    if (
      "abstract" in section_ranges &&
      page_number >= section_ranges["abstract"][0] &&
      page_number <= section_ranges["abstract"][1]
    ) {
      abstract_array.push(text);
    }
    // Methods
    if (
      "methods" in section_ranges &&
      page_number >= section_ranges["methods"][0] &&
      page_number <= section_ranges["methods"][1]
    ) {
      methods_array.push(text);
    }
    // Results
    if (
      "results" in section_ranges &&
      page_number >= section_ranges["results"][0] &&
      page_number <= section_ranges["results"][1]
    ) {
      results_array.push(text);
    }
    // Discussion
    if (
      "discussion" in section_ranges &&
      page_number >= section_ranges["discussion"][0] &&
      page_number <= section_ranges["discussion"][1]
    ) {
      discussion_array.push(text);
    }
  }

  return {
    introduction: introduction_array,
    abstract: abstract_array,
    methods: methods_array,
    results: results_array,
    discussion: discussion_array,
    citations: [],
  };
}

/**
 * Build a PaperDict from the full PDF text array, including the final citations.
 */
export async function processJsonArray(
  paper_array: PaperArrayElement[],
  client: Anthropic
): Promise<PaperDict> {
  const section_ranges = await extractSections(client, paper_array);
  const paper_array_dict = create_section_arrays(paper_array, section_ranges);

  const lastPage = paper_array[paper_array.length - 1].metadata.page_number;
  paper_array_dict.citations = paper_array
    .filter(
      (el) =>
        el.metadata.page_number >= lastPage - CITATIONS_OFFSET &&
        typeof el.text === "string"
    )
    .map((el) => el.text);

  return paper_array_dict;
}

/**
 * Generate three suggested research questions for the given paper dictionary.
 */
export async function get_suggested_questions(
  paper_dict: string
): Promise<string[]> {
  try {
    const client = getClient(); // Adjust if you must await or pass config
    const prompt_questions = get_prompt_suggested_questions(paper_dict);
    const generated_questions_text = await generateResponse(
      client,
      prompt_questions,
      "claude-3-5-sonnet-20241022",
      8192
    );

    const lines = generated_questions_text.trim().split("\n");
    const questions = lines.filter((q) => q.trim().length > 0);
    logger.info(`Generated suggested questions from Claude: ${questions}`);
    return questions;
  } catch (e) {
    logger.error("Error generating questions", e);
    return [];
  }
}
