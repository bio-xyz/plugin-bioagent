import axios, { AxiosError } from "axios";
import { SparqlError } from "../errors";

export async function sparqlRequest(query: string) {
    try {
        const { data } = await axios.post(
            "http://localhost:7878/query",
            query,
            {
                headers: {
                    "Content-Type": "application/sparql-query",
                    Accept: "application/sparql-results+json",
                },
            }
        );
        return data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new SparqlError(
                `SPARQL request failed: ${error.message}`,
                error
            );
        }
        throw error;
    }
}
