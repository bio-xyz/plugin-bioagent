import { logger } from "@elizaos/core";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

/**
 * Downloads the PDF and extracts the DOI for a given paper URL.
 * Supports bioRxiv and arXiv URLs.
 *
 * @param paperUrl - The URL of the paper's abstract page.
 */
export async function downloadPaperAndExtractDOI(paperUrl: string) {
  let pdfUrl: string;
  let fileName: string;

  if (paperUrl.includes("biorxiv.org")) {
    // For bioRxiv, the PDF URL is the paper URL appended with '.full.pdf'
    pdfUrl = paperUrl + ".full.pdf";
    fileName = "biorxiv_paper.pdf";
  } else if (paperUrl.includes("arxiv.org")) {
    // For arXiv, replace '/abs/' with '/pdf/' and append '.pdf'
    pdfUrl = paperUrl.replace("/abs/", "/pdf/") + ".pdf";
    fileName = "arxiv_paper.pdf";
  } else {
    logger.error("Unsupported URL. Only bioRxiv and arXiv URLs are supported.");
    return;
  }

  try {
    const htmlResponse = await axios.get(paperUrl); // raw html
    const htmlData: string = htmlResponse.data;
    const $ = cheerio.load(htmlData);

    let doi: string | undefined = $('meta[name="citation_doi"]').attr(
      "content"
    );

    // fallback for arXiv
    if (!doi && paperUrl.includes("arxiv.org")) {
      const doiAnchor = $('a[href*="doi.org"]').first();
      if (doiAnchor.length > 0) {
        const doiHref = doiAnchor.attr("href");
        if (doiHref) {
          doi = doiHref.replace(/^https?:\/\/doi\.org\//, "");
        }
      }
    }

    if (doi) {
      logger.info("DOI:", doi);
    } else {
      logger.info("DOI not found using any method.");
    }

    const pdfResponse = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
    });
    const pdfBuffer: Buffer = Buffer.from(pdfResponse.data, "binary");

    // fs.writeFileSync(fileName, new Uint8Array(pdfBuffer));
    logger.info(`PDF file downloaded successfully as "${fileName}".`);
    return { pdfBuffer, doi };
  } catch (error) {
    logger.error("An error occurred during the process:", error);
    return { pdfBuffer: null, doi: null };
  }
}

// downloadPaperAndExtractDOI(
//   "https://www.biorxiv.org/content/10.1101/2025.02.19.639050v1"
// );
// downloadPaperAndExtractDOI("https://arxiv.org/abs/2412.21154");
