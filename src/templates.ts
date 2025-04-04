import { dkgMemoryTemplate } from "./constants";

export const createDKGMemoryTemplate = `
  You are tasked with creating a structured memory JSON-LD object for an AI agent. The memory represents the interaction captured via social media. Your goal is to extract all relevant information from the provided user query and additionalContext which contains previous user queries (only if relevant for the current user query) to populate the JSON-LD memory template provided below.

  ** Template **
  The memory should follow this JSON-LD structure:
  ${JSON.stringify(dkgMemoryTemplate)}

  ** Instructions **
  1. Extract the main idea of the user query and use it to create a concise and descriptive title for the memory. This should go in the "headline" field.
  2. Store the original post in "articleBody".
  3. Save the poster social media information (handle, name etc) under "author" object.
  4. For the "about" field:
     - Identify the key topics or entities mentioned in the user query and add them as Thing objects.
     - Use concise, descriptive names for these topics.
     - Where possible, create an @id identifier for these entities, using either a provided URL, or a well known URL for that entity. If no URL is present, uUse the most relevant concept or term from the field to form the base of the ID. @id fields must be valid uuids or URLs
  5. For the "keywords" field:
     - Extract relevant terms or concepts from the user query and list them as keywords.
     - Ensure the keywords capture the essence of the interaction, focusing on technical terms or significant ideas.
  6. Ensure all fields align with the schema.org ontology and accurately represent the interaction.
  7. Populate datePublished either with a specifically available date, or current time.

  ** Input **
  User Query: {{currentPost}}
  Recent messages: {{recentMessages}}

  ** Output **
  Generate the memory in the exact JSON-LD format provided above, fully populated based on the input query.
  Make sure to only output the JSON-LD object. DO NOT OUTPUT ANYTHING ELSE, DONT ADD ANY COMMENTS OR REMARKS, JUST THE JSON LD CONTENT WRAPPED IN { }.
  `;

export const extractScientificPaperUrls = `# Prompt: Information Extraction Based on Schema

You are an AI assistant designed to extract information according to a specific Zod schema. Your task is to analyze the INPUT provided by the user and structure it according to the given schema.

## Schema Definition
export const scientificPaperUrlsSchema = z.object({
    urls: z.array(z.string().url()),
});

## Instructions:
1. Extract all URLs pointing to scientific papers from the user's input
2. Ensure each URL is valid according to the schema requirement
3. Structure the output as a JSON object with an array of URLs under the "urls" key
4. If no valid URLs are found, return an object with an empty array: { "urls": [] }
5. Do not include invalid URLs in the response

## INPUT:
Recent messages: {{recentMessages}}

## Example Response:
{
  "urls": [
    "https://arxiv.org/abs/2304.01373",
    "https://www.nature.com/articles/s41586-021-03819-2"
  ]
}

Please provide text that may contain scientific paper URLs, and I will extract and structure them according to the schema.`;
