import "dotenv/config";
import { getClient } from "./anthropicClient";
import { downloadPaperAndExtractDOI } from "./downloadPaper";
import { paperExists } from "./sparqlQueries";
import { logger } from "@elizaos/core";
import { makeUnstructuredApiRequest } from "./unstructuredPartitioning";

import { processJsonArray, process_paper, create_graph } from "./processPaper";
import { getSummary } from "./vectorize";
import { fromPath } from "pdf2pic";
import fs from "fs";
import { categorizeIntoDAOsPrompt } from "./llmPrompt";
import DKG from "dkg.js";
const unstructuredApiKey = process.env.UNSTRUCTURED_API_KEY;

type DKGClient = typeof DKG | null;

// const jsonArr = JSON.parse(fs.readFileSync('arxiv_paper.json', 'utf8'));

interface PaperArrayElement {
  metadata: {
    page_number: number;
    [key: string]: unknown;
  };
  text: string;
  [key: string]: unknown;
}

interface TaskInstance {
  xcom_push(key: string, value: string): void;
}

interface GeneratedGraph {
  "@context": Record<string, string>;
  "@id"?: string;
  "dcterms:hasPart"?: string;
  "cito:cites"?: unknown;
  [key: string]: unknown;
}

/**
 * Takes an array of JSON elements representing the paper's text
 * and returns a "knowledge assembly" (semantic graph) that includes
 * extracted metadata, citation info, subgraphs, and a summary.
 */
export async function jsonArrToKa(jsonArr: PaperArrayElement[], doi: string) {
  const client = getClient();

  const paperArrayDict = await processJsonArray(jsonArr, client);

  const [
    generatedBasicInfo,
    generatedCitations,
    generatedGoSubgraph,
    generatedDoidSubgraph,
    generatedChebiSubgraph,
    generatedAtcSubgraph,
  ] = await process_paper(client, paperArrayDict);

  const generatedGraph = await create_graph(
    client,
    generatedBasicInfo,
    generatedCitations,
    {
      go: generatedGoSubgraph,
      doid: generatedDoidSubgraph,
      chebi: generatedChebiSubgraph,
      atc: generatedAtcSubgraph,
    }
  );

  generatedGraph["dcterms:hasPart"] = await getSummary(client, generatedGraph);

  generatedGraph["@id"] = `https://doi.org/${doi}`; // the doi that we extracted from the paper

  // Update citations, if they exist
  // if (
  //   generatedGraph['cito:cites'] &&
  //   Array.isArray(generatedGraph['cito:cites']) &&
  //   generatedGraph['cito:cites'].length > 0
  // ) {
  //   generatedGraph['cito:cites'] = getFinalCitations(
  //     generatedGraph['cito:cites'],
  //   );
  // }

  // Ensure @context has schema entry
  const context = generatedGraph["@context"] as Record<string, string>;
  if (!("schema" in context)) {
    context["schema"] = "http://schema.org/";
    logger.info("Added 'schema' to @context in KA");
  }

  return generatedGraph;
  // console.log(generatedGraph);
}

// jsonArrToKa(jsonArr, {
//   xcom_push: (key: string, value: string) => {
//     console.log(`${key}: ${value}`);
//   },
// });
/**
/**
/**
 * Recursively remove all colons (":") from string values in an object or array,
 * except for certain cases:
 *   1) Skip the entire "@context" object (do not remove colons from any values inside it).
 *   2) Skip any string where the key is "@type".
 *   3) Skip any string that appears to be a URL (starting with "http://", "https://", or "doi:").
 * @param data - The input data which can be an object, array, or primitive.
 * @param parentKey - The key of the parent property (used to check exceptions).
 * @returns A new object, array, or primitive with colons removed from allowed string values.
 */
function removeColonsRecursively<T>(data: T, parentKey?: string): T {
  // 1) If the parent key is "@context", return the data as-is (skip processing entirely)
  if (parentKey === "@context") {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) =>
      removeColonsRecursively(item, parentKey)
    ) as unknown as T;
  }

  // Handle objects
  if (data !== null && typeof data === "object") {
    const newObj: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = removeColonsRecursively(
          (data as Record<string, unknown>)[key],
          key
        );
      }
    }
    return newObj as T;
  }

  // Handle strings
  if (typeof data === "string") {
    // 2) If this is the value of "@type", skip removing colons.
    if (parentKey === "@type") {
      return data as unknown as T;
    }

    // 3) If it's a URL/DOI (starts with http://, https://, or doi:), skip removing colons.
    if (/^(https?:\/\/|doi:)/i.test(data)) {
      return data as unknown as T;
    }

    // Otherwise, remove all colons
    return data.replace(/:/g, "") as unknown as T;
  }

  // For numbers, booleans, null, etc., just return as is
  return data;
}
const daoUals = {
  VitaDAO:
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101956",
  AthenaDAO:
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101957",
  PsyDAO:
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101958",
  ValleyDAO:
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101959",
  HairDAO:
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101961",
  CryoDAO:
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101962",
  "Cerebrum DAO":
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101963",
  Curetopia:
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101964",
  "Long Covid Labs":
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101965",
  "Quantum Biology DAO":
    "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101966",
};

export async function generateKaFromUrls(urls: [string]) {
  for (const url of urls) {
    const { pdfBuffer, doi } = await downloadPaperAndExtractDOI(url);
    if (!pdfBuffer) {
      throw new Error("Failed to download paper");
    }
    if (!doi) {
      throw new Error("Failed to extract DOI");
    }
    const paperArray = await makeUnstructuredApiRequest(
      pdfBuffer,
      "paper.pdf",
      unstructuredApiKey
    );
    const ka = await jsonArrToKa(paperArray, doi);
    const cleanedKa = removeColonsRecursively(ka);
    return cleanedKa;
  }
}
export interface Image {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/png";
    data: string;
  };
}
async function extractDOIFromPDF(images: Image[]) {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    messages: [
      {
        role: "user",
        content: [
          ...images,
          {
            type: "text",
            text: "Extract the DOI from the paper. Only return the DOI, no other text.",
          },
        ],
      },
    ],
    max_tokens: 50,
  });
  return response.content[0].type === "text"
    ? response.content[0].text
    : undefined;
}

async function categorizeIntoDAOs(images: Image[]) {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-3-7-sonnet-20250219",
    system: categorizeIntoDAOsPrompt,
    messages: [
      {
        role: "user",
        content: [...images],
      },
    ],
    max_tokens: 50,
  });
  return response.content[0].type === "text"
    ? response.content[0].text
    : undefined;
}

export async function generateKaFromPdf(pdfPath: string, dkgClient: DKGClient) {
  const options = {
    density: 100,
    format: "png",
    width: 595,
    height: 842,
  };
  const convert = fromPath(pdfPath, options);
  logger.info(`Converting ${pdfPath} to images`);

  const storeHandler = await convert.bulk(-1, { responseType: "base64" });

  const imageMessages = storeHandler
    .filter((page) => page.base64)
    .map((page) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: "image/png" as const,
        data: page.base64!,
      },
    }));
  logger.info(`Extracting DOI`);
  const doi = await extractDOIFromPDF(imageMessages);
  if (!doi) {
    throw new Error("Failed to extract DOI");
  }
  const paperExistsResult = await dkgClient.graph.query(
    paperExists(doi),
    "SELECT"
  );
  if (paperExistsResult.data) {
    logger.info(`Paper ${pdfPath} already exists in DKG, skipping`);
    return;
  } else {
    logger.info(`Paper ${pdfPath} does not exist in DKG, creating`);
  }
  const pdfBuffer = fs.readFileSync(pdfPath);
  const paperArray = await makeUnstructuredApiRequest(
    pdfBuffer,
    "paper.pdf",
    unstructuredApiKey
  );
  const ka = await jsonArrToKa(paperArray, doi);
  const cleanedKa = removeColonsRecursively(ka);
  const relatedDAOsString = await categorizeIntoDAOs(imageMessages);

  const daos = JSON.parse(relatedDAOsString);

  const daoUalsMap = daos.map((dao) => {
    const daoUal = daoUals[dao];
    return {
      "@id": daoUal,
      "@type": "schema:Organization",
      "schema:name": dao,
    };
  });
  cleanedKa["schema:relatedTo"] = daoUalsMap;

  return cleanedKa;
}
