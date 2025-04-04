import { z } from "zod";
import crypto from "crypto";

/*
 * Initial standardized schema for the scientific paper KA
 * with expanded descriptions for each field
 */

// TODO: add IPFS

// fixed default context with additional biomedical ontologies
const defaultContext = {
  schema: "https://schema.org/",
  fabio: "http://purl.org/spar/fabio/",
  cito: "http://purl.org/spar/cito/",
  dcterms: "http://purl.org/dc/terms/",
  foaf: "http://xmlns.com/foaf/0.1/",
  bibo: "http://purl.org/ontology/bibo/",
  go: "http://purl.obolibrary.org/obo/GO_",
  doid: "http://purl.org/obo/DOID_",
  chebi: "http://purl.org/obo/CHEBI_",
  atc: "http://purl.org/obo/ATC_",
  pw: "http://purl.org/obo/PW_",
  eco: "http://purl.org/obo/ECO_",
  mondo: "http://purl.org/obo/MONDO_",
  comptox: "https://comptox.epa.gov/",
  mesh: "http://id.nlm.nih.gov/mesh/",
} as const;

const ContextSchema = z
  .object({
    schema: z.literal("https://schema.org/"),
    fabio: z.literal("http://purl.org/spar/fabio/"),
    cito: z.literal("http://purl.org/spar/cito/"),
    dcterms: z.literal("http://purl.org/dc/terms/"),
    foaf: z.literal("http://xmlns.com/foaf/0.1/"),
    bibo: z.literal("http://purl.org/ontology/bibo/"),
    go: z.literal("http://purl.obolibrary.org/obo/GO_"),
    doid: z.literal("http://purl.org/obo/DOID_"),
    chebi: z.literal("http://purl.org/obo/CHEBI_"),
    atc: z.literal("http://purl.org/obo/ATC_"),
    pw: z.literal("http://purl.org/obo/PW_"),
    eco: z.literal("http://purl.org/obo/ECO_"),
    mondo: z.literal("http://purl.org/obo/MONDO_"),
    comptox: z.literal("https://comptox.epa.gov/"),
    mesh: z.literal("http://id.nlm.nih.gov/mesh/"),
  })
  .default(defaultContext)
  .describe(
    "Context prefixes for JSON-LD, mapping short prefixes (e.g. go:) to full IRIs."
  );

// creator (author) schema
const CreatorSchema = z.object({
  "@id": z
    .string()
    .describe(
      "Unique identifier for the creator, typically an ORCID URI. Defaults to a kebab-case of the creator's name."
    )
    .default(`https://orcid.org/${crypto.randomUUID()}`),
  "@type": z
    .string()
    .describe(
      "RDF type of the creator (e.g. foaf:Person). Identifies the class of this entity in Linked Data."
    ),
  "foaf:name": z
    .string()
    .describe(
      "Full display name of the creator, e.g. 'Alice Smith' or 'Alice B. Smith'."
    ),
});

// publication venue schema
const PublicationVenueSchema = z.object({
  "@id": z
    .string()
    .describe(
      "Primary identifier (e.g. DOI) of the publication venue (journal, conference, repository)."
    ),
  "@type": z
    .string()
    .describe(
      "RDF type of the publication venue (e.g. fabio:Journal, schema:Periodical)."
    ),
  "schema:name": z
    .string()
    .describe(
      "Human-readable name of the publication venue, e.g. 'Nature' or 'Proceedings of XYZ Conference'."
    ),
});

// section schema
const SectionSchema = z.object({
  "@id": z
    .string()
    .describe(
      "Short ID or local identifier for this section, often used as a fragment or anchor."
    ),
  "@type": z
    .string()
    .describe(
      "RDF type for the section, e.g. 'fabio:Section' or similar to define its role in the paper."
    ),
  "dcterms:title": z
    .string()
    .describe(
      "Heading or title of this section, e.g. 'Methods', 'Results', 'Discussion'."
    ),
  "fabio:hasContent": z
    .string()
    .describe(
      "Full textual content of the section (may include paragraphs of text, tables, etc.)."
    ),
});

// citation schema
const CitationSchema = z.object({
  "@id": z
    .string()
    .describe(
      "A unique identifier (often a DOI) for the cited work being referenced."
    ),
  "@type": z
    .string()
    .describe(
      "RDF type of the cited resource, e.g. 'bibo:AcademicArticle' or 'schema:ScholarlyArticle'."
    ),
  "dcterms:title": z.string().describe("Title of the cited work or resource."),
  "bibo:doi": z
    .string()
    .describe(
      "Explicit DOI string of the cited work, e.g. '10.1038/s41586-020-XXXXX'."
    ),
});

// ontology schema
export const OntologySchema = z.object({
  "@id": z
    .string()
    .describe(
      "Compact or full IRI of the ontology term discussed in the paper (e.g. GO, DOID, CHEBI, ATC, etc.) or 'http://purl.obolibrary.org/obo/xxx'."
    ),
  "schema:name": z
    .string()
    .describe(
      "Human-readable label of the ontology concept discussed in the paper"
    ),
});

export const OntologiesSchema = z.object({
  ontologies: z.array(OntologySchema),
});

// research paper schema
export const PaperSchema = z
  .object({
    "@context": ContextSchema,
    "@id": z
      .string()
      .describe("Top-level identifier for the paper, typically a DOI.")
      .default(`https://doi.org/10.1234/${crypto.randomInt(10000, 99999)}`),
    "@type": z
      .string()
      .describe(
        "Type of the paper, typically 'bibo:AcademicArticle' or 'schema:ScholarlyArticle'."
      ),
    "dcterms:title": z
      .string()
      .describe("Title of the paper, e.g. 'A Study on ...'."),
    "dcterms:creator": z
      .array(CreatorSchema)
      .describe(
        "List of creators (authors). Each entry follows CreatorSchema, containing @id, @type, foaf:name."
      ),
    "dcterms:abstract": z
      .string()
      .describe("Abstract text summarizing the paper's content and findings."),
    "schema:datePublished": z
      .string()
      .describe("Publication date, usually an ISO 8601 string (YYYY-MM-DD)."),
    "schema:keywords": z
      .array(z.string())
      .describe(
        "List of keywords or key phrases describing the paper's topics."
      ),
    "fabio:hasPublicationVenue": PublicationVenueSchema.describe(
      "Metadata about where this paper was published (journal, conference, etc.)."
    ),
    "fabio:hasPart": z
      .array(SectionSchema)
      .describe(
        "Sections that compose the paper. Each section has an @id, @type, title, and content."
      ),
    "cito:cites": z
      .array(CitationSchema)
      .describe(
        "References/citations this paper includes. Each entry has an identifier, type, title, and DOI."
      ),
  })
  .describe(
    "Complete JSON-LD schema for a scientific paper, including authors, venue, sections, citations, and ontology references."
  );

export type Paper = z.infer<typeof PaperSchema>;
