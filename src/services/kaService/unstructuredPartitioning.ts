import axios from "axios";
import FormData from "form-data";
import fs from "fs/promises";
import "dotenv/config";
import { logger } from "@elizaos/core";

const apiKey = process.env.UNSTRUCTURED_API_KEY;

/**
 * Makes a POST request to the Unstructured API.
 *
 * @param fileBytes - The file content as a Buffer.
 * @param filename - Name of the file.
 * @param apiKey - Unstructured API key.
 * @returns The parsed API response.
 */
export async function makeUnstructuredApiRequest(
  fileBytes: Buffer,
  filename: string,
  apiKey: string
) {
  const url = "https://api.unstructuredapp.io/general/v0/general";

  // Create a FormData instance and append file and other data.
  const formData = new FormData();
  formData.append("files", fileBytes, filename);
  formData.append("pdf_infer_table_structure", "true");
  formData.append("skip_infer_table_types", "[]");
  formData.append("strategy", "hi_res");

  // Merge the custom header with form-data headers.
  const headers = {
    "unstructured-api-key": apiKey,
    ...formData.getHeaders(),
  };

  logger.info("Making Unstructured API request");
  const response = await axios.post(url, formData, {
    headers,
    timeout: 300000, // 300000 ms
  });

  logger.info("Got response from Unstructured API");
  return response.data;
}

// async function processPdfFiles(): Promise<void> {
//   try {
//     const arxivPdfBuffer = await fs.readFile("arxiv_paper.pdf");
//     const bioArxivPdfBuffer = await fs.readFile("biorxiv_paper.pdf");

//     const arxivResponse = await makeUnstructuredApiRequest(
//       arxivPdfBuffer,
//       "arxiv_paper.pdf",
//       apiKey
//     );
//     console.log("Response for arxiv_paper.pdf:", arxivResponse);
//     await fs.writeFile(
//       "arxiv_paper.json",
//       JSON.stringify(arxivResponse, null, 2)
//     );

//     const bioArxivResponse = await makeUnstructuredApiRequest(
//       bioArxivPdfBuffer,
//       "biorxiv_paper.pdf",
//       apiKey
//     );
//     console.log("Response for biorxiv_paper.pdf:", bioArxivResponse);
//     await fs.writeFile(
//       "biorxiv_paper.json",
//       JSON.stringify(bioArxivResponse, null, 2)
//     );
//   } catch (error) {
//     console.error("Error processing PDF files:", error);
//   }
// }

// processPdfFiles();
