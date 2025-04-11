import { Store, Quad } from "n3";
import { JsonLdParser } from "jsonld-streaming-parser";
import axios from "axios";
import crypto from "crypto";

/**
 * Recursively adds an @id field (with a random UUID) to all objects
 * in the parsed JSON-LD data structure that are missing the @id property.
 * This function skips the @context node to avoid "keyword redefinition" errors.
 */
function addMissingIdsToJsonLd(jsonLdString: string): string {
  // Parse the input JSON-LD string into an object
  const data = JSON.parse(jsonLdString);

  function ensureId(obj: any): void {
    if (Array.isArray(obj)) {
      // If it's an array, recurse on each element
      for (const item of obj) {
        ensureId(item);
      }
    } else if (obj && typeof obj === "object") {
      // If this object has a `@context`, skip going into it
      // so we don't accidentally insert @id into the @context object
      if (obj["@context"]) {
        // STOP recursion into @context
        // But still handle the top-level object’s other properties (besides @context)
        const contextValue = obj["@context"];
        delete obj["@context"]; // Temporarily remove @context
        if (!obj["@id"]) {
          obj["@id"] = crypto.randomUUID();
        }
        // Recurse on other keys (excluding @context which we removed)
        for (const key of Object.keys(obj)) {
          ensureId(obj[key]);
        }
        // Put @context back in its place after
        obj["@context"] = contextValue;
      } else {
        // If not dealing with the @context, we can safely add an @id
        if (!obj["@id"]) {
          obj["@id"] = crypto.randomUUID();
        }
        // Recurse on all children
        for (const key of Object.keys(obj)) {
          ensureId(obj[key]);
        }
      }
    }
  }

  ensureId(data);

  // Return the stringified JSON-LD (with newly added @id fields, skipping the context)
  return JSON.stringify(data, null, 2);
}

/**
 * Accepts a JSON-LD object, ensures valid @id fields, parses it to quads, and
 * stores the resulting data in Oxigraph. Returns a promise that resolves with `true` if successful.
 */
export async function storeJsonLd(jsonLd: object): Promise<boolean> {
  const store = new Store();
  const parser = new JsonLdParser();

  // Fix / add valid @id fields
  const fixedJsonLdString = addMissingIdsToJsonLd(JSON.stringify(jsonLd));

  return new Promise((resolve, reject) => {
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

    // Begin parsing the fixed JSON-LD
    try {
      parser.write(fixedJsonLdString);
      parser.end();
    } catch (error: any) {
      console.error("Error during parser execution:", error);
      reject(error);
    }
  });
}
