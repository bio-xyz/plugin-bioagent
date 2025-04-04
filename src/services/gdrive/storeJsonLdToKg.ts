import { Store, Quad } from "n3";
import { JsonLdParser } from "jsonld-streaming-parser";
import axios from "axios";

/**
 * Accepts a JSON-LD object, parses it, and stores the resulting data in Oxigraph.
 * @param jsonLd A JSON-LD object to be parsed.
 * @returns A promise that resolves with `true` if successful.
 */
export async function storeJsonLd(jsonLd: object): Promise<boolean> {
  const store = new Store();
  const parser = new JsonLdParser();

  return new Promise((resolve, reject) => {
    // Attach stream listeners
    parser.on("data", (quad: Quad) => {
      store.addQuad(quad);
    });

    parser.on("error", (error: Error) => {
      console.error("Parsing error:", error);
      reject(error);
    });

    parser.on("end", async () => {
      try {
        console.log(`Parsed ${store.size} quads`);

        // Convert store data to N-Triples
        const ntriples = store
          .getQuads(null, null, null, null)
          .map(
            (quad) =>
              `<${quad.subject.value}> <${quad.predicate.value}> ${
                quad.object.termType === "Literal"
                  ? `"${quad.object.value}"`
                  : `<${quad.object.value}>`
              }.`
          )
          .join("\n");

        // Send N-Triples to Oxigraph
        const response = await axios.post(
          "http://localhost:7878/store",
          ntriples,
          {
            headers: {
              "Content-Type": "application/n-quads",
            },
          }
        );

        if (response.status === 204) {
          console.log("Successfully stored JSON-LD in Oxigraph");
          resolve(true);
        } else {
          reject(new Error(`Unexpected response status: ${response.status}`));
        }
      } catch (error: any) {
        console.error("Error storing JSON-LD in Oxigraph:", error);
        reject(error);
      }
    });

    // Begin parsing
    try {
      parser.write(JSON.stringify(jsonLd));
      parser.end();
    } catch (error: any) {
      console.error("Error during parser execution:", error);
      reject(error);
    }
  });
}
