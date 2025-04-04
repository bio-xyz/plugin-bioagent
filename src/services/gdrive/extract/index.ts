import Config from "./config";
import path from "path";
import { PaperSchema, OntologiesSchema } from "./z";
import { ontologiesExtractionPrompt, extractionPrompt } from "./prompts";
import { OpenAIImage } from "./types";

const __dirname = path.resolve();

async function extractPaper(images: OpenAIImage[]) {
  console.log(
    `[extractPaper] Starting paper extraction with ${images.length} images`
  );
  const client = Config.instructorOai;

  const { _meta, ...paper } = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: extractionPrompt,
      },
      {
        role: "user",
        content: [...images],
      },
    ],
    response_model: { schema: PaperSchema, name: "Paper" },
    max_retries: 3,
  });
  console.log(`[extractPaper] Paper extraction completed successfully`);
  return paper;
}

async function extractOntologies(images: OpenAIImage[]) {
  console.log(
    `[extractOntologies] Starting ontologies extraction with ${images.length} images`
  );
  const client = Config.instructorOai;

  const { _meta, ...ontologies } = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: ontologiesExtractionPrompt,
      },
      {
        role: "user",
        content: [...images],
      },
    ],
    response_model: { schema: OntologiesSchema, name: "Ontologies" },
    max_retries: 3,
  });
  console.log(
    `[extractOntologies] Ontologies extraction completed successfully`
  );
  return ontologies;
}

export async function generateKa(images: OpenAIImage[]) {
  console.log(
    `[generateKa] Starting knowledge extraction with ${images.length} images`
  );
  const res = await Promise.all([
    extractPaper(images),
    extractOntologies(images),
  ]);
  console.log(`[generateKa] All extractions completed, combining results`);
  res[0]["ontologies"] = res[1];
  console.log(`[generateKa] Knowledge extraction successfully completed`);
  return res[0];
}
