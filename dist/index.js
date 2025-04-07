var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
import { logger as logger15 } from "@elizaos/core";

// src/actions/dkgInsert.ts
import dotenv from "dotenv";
import {
  logger as logger7
} from "@elizaos/core";

// src/constants.ts
var DKG_EXPLORER_LINKS = {
  testnet: "https://dkg-testnet.origintrail.io/explore?ual=",
  mainnet: "https://dkg.origintrail.io/explore?ual="
};

// src/actions/dkgInsert.ts
import DKG from "dkg.js";

// src/services/kaService/kaService.ts
import "dotenv/config";

// src/services/kaService/anthropicClient.ts
import "dotenv/config";
import { Anthropic } from "@anthropic-ai/sdk";
var apiKey = process.env.ANTHROPIC_API_KEY;
function getClient() {
  return new Anthropic({ apiKey });
}
async function generateResponse(client, prompt, model = "claude-3-5-sonnet-20241022", maxTokens = 1500) {
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }]
  });
  if (response.content && response.content.length > 0 && response.content[0].type === "text") {
    return response.content[0].text;
  } else {
    throw new Error("No response received from Claude.");
  }
}

// src/services/kaService/downloadPaper.ts
import { logger } from "@elizaos/core";
import axios from "axios";
import * as cheerio from "cheerio";

// src/services/kaService/sparqlQueries.ts
function paperExists(doi) {
  if (doi.startsWith("https://doi.org/")) {
    doi = doi.replace("https://doi.org/", "");
  }
  const paperExistsQuery = `PREFIX fabio: <http://purl.org/spar/fabio/>
    PREFIX dcterms: <http://purl.org/dc/terms/>

    ASK {
    ?paper a fabio:ResearchPaper ;
            dcterms:identifier ?doi .
    
    FILTER (STR(?doi) = "https://doi.org/${doi}")
    }
    `;
  return paperExistsQuery;
}

// src/services/kaService/kaService.ts
import { logger as logger6 } from "@elizaos/core";

// src/services/kaService/unstructuredPartitioning.ts
import axios2 from "axios";
import FormData from "form-data";
import "dotenv/config";
import { logger as logger2 } from "@elizaos/core";
var apiKey2 = process.env.UNSTRUCTURED_API_KEY;
async function makeUnstructuredApiRequest(fileBytes, filename, apiKey3) {
  const url = "https://api.unstructuredapp.io/general/v0/general";
  const formData = new FormData();
  formData.append("files", fileBytes, filename);
  formData.append("pdf_infer_table_structure", "true");
  formData.append("skip_infer_table_types", "[]");
  formData.append("strategy", "hi_res");
  const headers = {
    "unstructured-api-key": apiKey3,
    ...formData.getHeaders()
  };
  logger2.info("Making Unstructured API request");
  const response = await axios2.post(url, formData, {
    headers,
    timeout: 3e5
    // 300000 ms
  });
  logger2.info("Got response from Unstructured API");
  return response.data;
}

// src/services/kaService/exampleForPrompts.ts
var basic_info_example_input = `
    [{
        "element_id": "XXXX",
        "metadata": {
        "filename": "file.pdf",
        "filetype": "application/pdf",
        "languages": ["eng"],
        "page_number": 1,
        "parent_id": "XXXX"
        },
        "text": "Title of the paper in XYZ journal https://doi.org/XX.XXXX/XX.XXXX",
        "type": "NarrativeText"
    },
    {
        "element_id": "XXXX",
        "metadata": {
        "filename": "file.pdf",
        "filetype": "application/pdf",
        "languages": ["eng"],
        "page_number": 1,
        "parent_id": "XXXX"
        },
        "text": "AuthorX, AuthorY, AuthorZ",
        "type": "NarrativeText"
    }]
`;
var basic_info_example_output = `
{
"title": "Title of the paper",
"authors": ["AuthorX", "AuthorY", "AuthorZ"],
"abstract": "",
"publication_date": "",
"publisher": "",
"volume": "",
"issue": "",
"page_numbers": "",
"doi": "https://doi.org/XX.XXXX/XX.XXXX",
"conflict_of_interest": "",
"obi_details": {
    "has_specified_output": [
        {
        "description": "Generated data on the ..."
        }
    ],
    "instrument": [
        {
        "name": "Instrument X",
        "description": "Description of Instrument X"
        }
    ],
    "data_transformation": [
        {
        "name": "Example Transformation",
        "description": "Transformation used in the experiment"
        }
    ],
    "recruitment_status": [
        {
        "description": "Recruitment status of the experiment"
        }
    ],
    "assay": [
        {
        "description": "Description of the assay used"
        }
    ]
}
}
`;
var citations_example_input = `
Doe John, Jane Doe, Paper title example 1, https://doi.org/random-doi-identifier1
Doe Peter, Maria Doe, Paper title example 2, https://doi.org/random-doi-identifier2
Smith Smith, Bob Smith, Paper title example 3, https://doi.org/random-doi-identifier3
`;
var citations_example_output = `
"citations": "Doe John, Paper title example 1 - https://doi.org/random-doi-identifier1
Doe Peter, Paper title example 2 - https://doi.org/random-doi-identifier2
Smith Smith, Paper title example 3 - https://doi.org/random-doi-identifier3"
`;
var subgraph_go_example_input = `
[
{
    "text": "Description of a biological process involving X and Y."
}
]
`;
var subgraph_go_example_output = `
[
{
    "subject": "example biological term 1", // Make sure to use the name of the subject, not the Gene Ontology ID (GO_...)
    "predicate": "example Gene Ontology relationship",
    "object": "example biological term 1", // Make sure to use the name of the object, not the Gene Ontology ID (GO_...)
    "explanation": "example explanation ..."
}
]
`;
var subgraph_doid_example_input = `
[
{
    "text": "Description of Disease X with symptoms Y and Z."
}
]
`;
var subgraph_doid_example_output = `
[
{
    "disease": "Disease X",
    "findings": "Disease X is characterized by symptoms Y and Z."
}
]
`;
var subgraph_chebi_example_input = `
[
{
    "text": "Description of Chemical Compound X."
}
]
`;
var subgraph_chebi_example_output = `
[
{
    "compound": "Chemical Compound X",
    "findings": "Chemical Compound X is known for its properties Y and Z."
}
]
`;
var subgraph_atc_example_input = `
[
{
    "text": "Description of Drug X classified under ATC code Y."
}
]
`;
var subgraph_atc_example_output = `
[
{
    "drug": "Drug X",
    "findings": "Drug X, classified under ATC code Y, is used for treating Z."
}
]
`;
var gene_ontology_example_input = `
[
    {
        "subject": {"term": "GO term example subject name", "id": "GO_XXXXXX"},
        "predicate": "some of the gene ontology relationships",
        "object": {"term": "GO term example object name", "id": "GO_XXXXXX"},
        "explanation": "example explanation ..."
    }
]
`;
var example_basic_info = `
    {
    "title": "Preliminary Study on X",
    "authors": ["Author A", "Author B"],
    "abstract": "This study investigates...",
    "publication_date": "",
    "publisher": "",
    "volume": "",
    "issue": "",
    "page_numbers": "",
    "doi": "",
    "conflict_of_interest": "The authors are also employed by the organization which funded the research.",
    "citations": "Author A, Author B. Paper title example 1. https://doi.org/XXXXX
    Author C, Author D. Paper title example 2. https://doi.org/YYYYY"
}
`;
var example_spar_output = `
    {
        "@context": {
            "fabio": "http://purl.org/spar/fabio/",
            "dcterms": "http://purl.org/dc/terms/",
            "foaf": "http://xmlns.com/foaf/0.1/",
            "cito": "http://purl.org/spar/cito/",
            "doco": "http://purl.org/spar/doco/",
            "pro": "http://purl.org/spar/pro/",
            "obi": "http://purl.obolibrary.org/obo/",
            "schema": "http://schema.org/"
        },
        "@type": "fabio:ResearchPaper",
        "dcterms:title": "Preliminary Study on X",
        "dcterms:creator": [
            {"@type": "foaf:Person", "foaf:name": "Dr. A"},
            {"@type": "foaf:Person", "foaf:name": "Prof. B"}
        ],
        "dcterms:abstract": "This study investigates...",
        "dcterms:date": "", // Use the release date/date of issueing here in "yyyy-mm-dd" format. You shouldn't include the attribute in case it's not found or empty
        "dcterms:publisher": "", // You shouldn't include the attribute in case it's not found or empty
        "fabio:hasJournalVolume": "", // You shouldn't include the attribute in case it's not found or empty
        "fabio:hasJournalIssue": "", // You shouldn't include the attribute in case it's not found or empty
        "fabio:hasPageNumbers": "", // You shouldn't include the attribute in case it's not found or empty
        "dcterms:identifier": "https://doi.org/ID", // Use the full DOI identifier here. You shouldn't include the attribute in case it's not found or empty
        "dcterms:rights": "", // You shouldn't include the attribute in case it's not found or empty
        "doco:hasPart": [], // You shouldn't include the attribute in case it's not found or empty
        "pro:roleIn": [],  // You shouldn't include the attribute in case it's not found or empty
        "obi:OBI_0000968": [ 
            {
                "foaf:name": "", // Instrument used
                "dcterms:description": ""
            }
        ],
        "obi:OBI_0200000": [  
            {
                "dcterms:description": "" // Data Transformation, for example which programming language was used to sort the data
            }
        ],
        "obi:OBI_0000070": [  
            {
                "dcterms:description": "" // Assay found in the science paper
            }
        ],
        "obi:OBI_0000251": [  
            {
                "dcterms:description": "" // Recruitment status of the paper, e.g. how many participants in the experiment
            }
        ],
        "obi:IAO_0000616": [  
            {
                "dcterms:description": "" // Conflict of interest of the authors
            }
        ]
    }
`;
var example_go_output = `
[
        {
            "@id": "http://purl.obolibrary.org/obo/GO_XXXXX", // Subject ID
            "dcterms:name": "Subject name",
            "obi:RO_XXXXX": {  /* Note for model: corresponds to a specific relationship */
                "@id": "http://purl.obolibrary.org/obo/GO_YYYYY",  // Object ID
                "dcterms:description": "Process X positively regulates Process Y in cell type Z. This involves the modulation of Factor A and Factor B, affecting outcome C as indicated by the experimental results."
                "dcterms:name": "Object name",
            }
        },
        {
            "@id": "http://purl.obolibrary.org/obo/GO_AAAAA", // Subject ID
            "obi:BFO_XXXXX": {  /* Note for model: corresponds to a specific relationship */
                "@id": "http://purl.obolibrary.org/obo/GO_BBBBB", // Object ID
                "dcterms:description": "Description of the process or relationship goes here."
            }
        }
        /* Other GO entries would be similarly structured */
]
`;
var example_json_citations = [
  {
    "@id": "https://doi.org/10.1234/another-article",
    "dcterms:title": "Related Work on Y"
  },
  {
    "@id": "https://doi.org/10.5678/related-work",
    "dcterms:title": "Further Discussion on Z"
  }
];
var example_graph = `
{
    "@context": {
        "fabio": "http://purl.org/spar/fabio/",
        "dcterms": "http://purl.org/dc/terms/",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "cito": "http://purl.org/spar/cito/",
        "doco": "http://purl.org/spar/doco/",
        "pro": "http://purl.org/spar/pro/",
        "obi": "http://purl.obolibrary.org/obo/"
    },
    "@type": "fabio:ResearchPaper",
    "dcterms:title": "KSR1 Knockout Mouse Model Demonstrates MAPK Pathway's Key Role in Cisplatin- and Noise-induced Hearing Loss",
    "dcterms:creator": [
        {
            "@type": "foaf:Person",
            "foaf:name": "Maria A. Ingersoll"
        },
        {
            "@type": "foaf:Person",
            "foaf:name": "Jie Zhang"
        },
        {
            "@type": "foaf:Person",
            "foaf:name": "Tal Teitz"
        }
    ],
    "dcterms:abstract": "Hearing loss is a major disability in everyday life and therapeutic interventions to protect hearing would bene\uFB01t a large portion of the world population. Here we found that mice devoid of the protein kinase suppressor of RAS 1 (KSR1) in their tissues (germline KO mice) exhibit resistance to both cisplatin- and noise-induced permanent hearing loss compared with their wild-type KSR1 litter- mates. KSR1 is a scaffold protein that brings in proximity the mitogen-activated protein kinase (MAPK) proteins BRAF, MEK1/2 and ERK1/2 and assists in their activation through a phosphorylation cascade induced by both cisplatin and noise insults in the cochlear cells. KSR1, BRAF, MEK1/2, and ERK1/2 are all ubiquitously expressed in the cochlea. Deleting the KSR1 protein tempered down the MAPK phosphorylation cascade in the cochlear cells following both cisplatin and noise insults and conferred hearing protection of up to 30 dB SPL in three tested frequencies in male and female mice. Treatment with dabrafenib, an FDA-approved oral BRAF inhibitor, protected male and female KSR1 wild-type mice from both cisplatin- and noise-induced hearing loss. Dabrafenib treatment did not enhance the protection of KO KSR1 mice, providing evidence dabrafenib works primarily through the MAPK pathway. Thus, either elimination of the KSR1 gene expression or drug inhibition of the MAPK cellular pathway in mice resulted in profound protection from both cisplatin- and noise-induced hearing loss. Inhibition of the MAPK pathway, a cel- lular pathway that responds to damage in the cochlear cells, can prove a valuable strategy to protect and treat hearing loss.",
    "dcterms:date": "2024-03-21",
    "dcterms:publisher": "Neurobiology of Disease",
    "dcterms:identifier": "https://doi.org/10.1523/JNEUROSCI.2174-23.2024",
    "dcterms:rights": "T.T. and J.Z. are inventors on a patent for the use of dabrafenib in hearing protection (US 2020-0093923 A1 and US Patent no 11,433,073, 18794717.1 / EP 3618807, Japan 2022-176126, China 201880029618.7) and are cofounders of Ting Therapeutics. All other authors declare that they have no competing \uFB01nancial interests.",
    "obi:OBI_0000299": [
        {
            "@id": "http://purl.obolibrary.org/obo/GO_0004672",
            "obi:RO_0002335": {
                "@id": "http://purl.obolibrary.org/obo/GO_0000165",
                "dcterms:description": "Knockout of the KSR1 gene reduces activation of the MAPK signaling pathway, which is involved in cellular stress and death in response to cisplatin and noise exposure."
            }
        },
        {
            "@id": "http://purl.obolibrary.org/obo/DOID_0050563",
            "dcterms:title": "Noise-induced hearing loss",
            "dcterms:description": "Genetic knockout of the KSR1 gene in mice confers resistance to noise-induced permanent hearing loss compared to wild-type littermates. KSR1 knockout mice had significantly less hearing loss, as demonstrated by auditory brainstem response, distortion product otoacoustic emission, outer hair cell counts, and synaptic puncta staining, compared to wild-type mice following noise exposure. Inhibition of the MAPK pathway, which includes BRAF, MEK, and ERK, was shown to be the mechanism by which KSR1 knockout mice were protected from noise-induced hearing loss."
        },
        {
            "@id": "http://purl.obolibrary.org/obo/CHEBI_75048",
            "dcterms:title": "Dabrafenib",
            "dcterms:description": "Dabrafenib is a BRAF inhibitor that protects against both cisplatin-induced and noise-induced hearing loss in mice by inhibiting the MAPK pathway. Dabrafenib is an FDA-approved drug, making it a promising compound to repurpose for the prevention of hearing loss."
        },
        {
            "@id": "http://purl.bioontology.org/ontology/ATC/L01XA01",
            "dcterms:title": "Cisplatin",
            "dcterms:description": "Cisplatin is a widely used chemotherapeutic agent that can cause permanent hearing loss as a side effect. Cisplatin-induced hearing loss is associated with activation of the MAPK pathway, which leads to cellular stress and damage in the inner ear. Genetic knockout of the KSR1 gene, which is involved in the MAPK pathway, conferred resistance to cisplatin-induced hearing loss in mice. Additionally, treatment with the BRAF inhibitor dabrafenib, which inhibits the MAPK pathway, also protected against cisplatin-induced hearing loss."
        }
    ],
    "obi:OBI_0000968": [
        {
            "foaf:name": "Not specified",
            "dcterms:description": "Various instruments and equipment were used in this study, but specific details were not provided."
        }
    ],
    "obi:OBI_0000293": [
        {
            "dcterms:description": "Utilized the KSR1 knockout mouse model and wild-type littermates as the study subjects."
        }
    ],
    "obi:OBI_0200000": [
        {
            "dcterms:description": "Analyzed single-cell RNA sequencing data from postnatal day 28 C57BL/6 mice to examine the expression of MAPK genes in the cochlea."
        },
        {
            "dcterms:description": "Performed statistical analysis to compare hearing outcomes and MAPK signaling between KSR1 knockout and wild-type mice."
        }
    ],
    "obi:OBI_0000070": [
        {
            "dcterms:description": "Evaluated hearing function in mice using auditory assessments."
        },
        {
            "dcterms:description": "Measured MAPK pathway activation in the cochlea through biochemical assays."
        }
    ]
}
`;

// src/services/kaService/llmPrompt.ts
function get_go_api_prompt(term, go_candidates) {
  return `
    Given the biological context, which of the following Gene Ontology (GO) terms best matches the description for '${term}'? Please select the most appropriate GO term or indicate if none apply by replying 'None'.

    GO Candidates in JSON format: ${JSON.stringify(go_candidates)}

    You must output the GO candidate which is the most suitable by replying with its id (e.g. 'GO_0043178'). If there are no suitable candidates output 'None'.
    MAKE SURE TO ONLY OUTPUT THE MOST SUITABLE ID OR 'None'. THE ID MUST BE IN FORMAT "GO_NUMBER" - USE "_" ALWAYS. DO NOT OUTPUT ANYTHING ELSE
    `;
}
function get_doid_api_prompt(term, doid_candidates) {
  return `
    Given the biological context, which of the following Disease Ontology (DOID) terms best matches the description for '${term}'? Please select the most appropriate DOID term or indicate if none apply by replying 'None'.

    DOID Candidates in JSON format: ${JSON.stringify(doid_candidates)}

    You must output the DOID candidate which is the most suitable by replying with its id (e.g. 'DOID_14330'). If there are no suitable candidates output 'None'.
    MAKE SURE TO ONLY OUTPUT THE MOST SUITABLE ID OR 'None'. THE ID MUST BE IN FORMAT "DOID_NUMBER" - USE "_" ALWAYS. DO NOT OUTPUT ANYTHING ELSE
    `;
}
function get_chebi_api_prompt(term, chebi_candidates) {
  return `
    Given the biological context, which of the following Chemical Entities of Biological Interest (ChEBI) terms best matches the description for '${term}'? Please select the most appropriate ChEBI term or indicate if none apply by replying 'None'.

    ChEBI Candidates in JSON format: ${JSON.stringify(chebi_candidates)}

    You must output the ChEBI candidate which is the most suitable by replying with its id (e.g. 'CHEBI_15377'). If there are no suitable candidates output 'None'.
    MAKE SURE TO ONLY OUTPUT THE MOST SUITABLE ID OR 'None'. THE ID MUST BE IN FORMAT "CHEBI_NUMBER" - USE "_" ALWAYS. DO NOT OUTPUT ANYTHING ELSE.
    `;
}
function get_atc_api_prompt(term, atc_candidates) {
  return `
    Given the biological context, which of the following Anatomical Therapeutic Chemical (ATC) terms best matches the description for '${term}'? Please select the most appropriate ATC term or indicate if none apply by replying 'None'.

    ATC Candidates in JSON format: ${JSON.stringify(atc_candidates)}

    You must output the ATC candidate which is the most suitable by replying with its id (e.g. 'A14AA04'). If there are no suitable candidates, output 'None'.
    MAKE SURE TO ONLY OUTPUT THE MOST SUITABLE ID OR 'None'.
    `;
}
function get_prompt_basic_info(paper_array) {
  return `**Prompt**:
    You are provided with chunks of a scientific paper in the form of JSON array elements, each containing parts of the paper such as potential titles, authors, and abstracts. Your task is to analyze these chunks incrementally to update and output the information listed below. If an element contains relevant information that improves upon or adds to the current data, update the respective fields; otherwise.

    **Task**
    1. Capture the title of the paper if a more accurate title is found in the chunk.
    2. Identify the authors list, refining or appending to the current list based on the new information found in the chunk. MAKE SURE TO USE FULL NAMES OF THE AUTHORS AND INCLUDE THEM ALL!
    3. Identify the abstract if more detailed or relevant information is provided in the chunk.
    4. Identify the publication date if found in any of the chunks.
    5. Identify the publisher or journal name if it can be extracted from the given data.
    6. Identify the volume and issue number of the journal in which the paper is published.
    7. Identify the page numbers that indicate where the paper is located within the journal.
    8. Identify the DOI (Digital Object Identifier) which provides a persistent link to the paper's online location.
    9. Capture key experimental details such as:
        OBI_0000299 'has_specified_output': Describe the types of data or results produced by the research.
        OBI_0000968 'instrument': Specify the instruments or equipment used in the research.
        OBI_0000293 'has_specified_input': Identify inputs such as samples or data sets utilized in the study.
        OBI_0200000 'data transformation': Explain any computational or analytical methods applied to raw data.
        OBI_0000251 'recruitment status': For clinical studies, provide details on the status of participant recruitment.
        OBI_0000070 'assay': Describe the specific assays used in the study to measure or observe biological, chemical, or physical processes, essential for validating the experimental hypothesis and ensuring reproducibility.
        IAO_0000616 'conflict of interest': If there's a conflict of interest mentioned in the paper, describe it here.

    **Example Input (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${basic_info_example_input}

    **Example Output (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${basic_info_example_output}

    Proceed with the analysis based on the structure and instructions provided in this prompt.

    **Actual paper array input**
    ${JSON.stringify(paper_array)}

    ** MAKE SURE TO INCLUDE THE TITLE, FULL AUTHOR LIST WITH THEIR FULL NAMES, ABSTRACT AND ALL OTHER INFORMATION ABOUT THE PAPER IN A JSON OBJECT, DO NOT INCLUDE ANY EXPLANATIONS OR ADDITIONAL CONTENT **
    `;
}
function get_prompt_citations(paper_array) {
  return `**Prompt**:
    Analyze the provided chunks of the final few pages of a scientific paper formatted as JSON array elements. Each element contains potential citations, likely preceded by the term 'References'.

    **Task**:
    1. Carefully examine each citation to ensure that none are omitted. Every citation found in the input must be included.
    2. Extract and return each citation, splitting each by a new line. Each citation should include the first author's name, the title and DOI URL identifier of the cited paper. 
    3. Confirm completeness by ensuring that every potential citation found in the input is included.

    **Instructions**:
    - Begin your examination from the section likely marked by 'References', as this is where citations typically start.
    - Ensure completeness by including every citation identified in the input. Do not skip any citations.
    - Output should consist only of the first author of the paper, the title and DOI URL of each citation, formatted as 'First author, title - DOI'.
    - Provide the citations as a simple list, each on a new line, adhering strictly to the format provided below. Do not include any other comments or remarks.

    **Example Input Format (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**:
    ${citations_example_input}

    **Example Output (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**:
    ${citations_example_output}

    **Actual Input to analyze**:
    ${JSON.stringify(paper_array)}

    **Final instruction**
    Provide me with the final output of citations, making sure to include the author and title of the cited paper and DOI in 'author, cited paper title - DOI' format, separating each citation by a new line.
    `;
}
function get_prompt_go_subgraph(paper_array) {
  return `**Prompt**:
    You are provided with a parsed scientific paper in the form of a JSON array. Analyze this array to extract relationships using Gene Ontology (GO) terms and identifiers based on the scientific analysis conducted within the paper. Utilize only the recognized relationships in the Gene Ontology, which include: "is_a", "part_of", "regulates", "positively_regulates", "negatively_regulates", "occurs_in", "capable_of", "capable_of_part_of", "has_part", "has_input", "has_output", "derives_from", and "derives_into". Each extracted relationship should be accompanied by a brief explanation that clarifies the relationship within the context of the scientific findings.

    Structure your response as a JSON array containing objects. Each object should have the following properties:

    subject: The GO term or identifier that acts or is described.
    predicate: The relationship from the Gene Ontology, only choosing from the following: "is_a", "part_of", "regulates", "positively_regulates", "negatively_regulates", "occurs_in", "capable_of", "capable_of_part_of", "has_part", "has_input", "has_output", "derives_from", and "derives_into".
    object: The GO term or identifier that is acted upon or described.
    explanation: A brief explanation of the relationship, indicating its relevance and context.

    **Example Input (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${subgraph_go_example_input}

    **Example Output (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${subgraph_go_example_output}

    Proceed with the analysis based on the structure and instructions provided in this prompt. MAKE SURE TO ONLY CREATE GENE ONTOLOGY TERMS THAT ACTUAL EXIST AND ARE SUPPORTED BY THE ONTOLOGY. MAKE SURE TO ONLY USE THE RELATIONSHIPS THAT I PROVIDED.

    **Actual paper array input**
    ${JSON.stringify(paper_array)}

    ** MAKE SURE TO ONLY OUTPUT THE JSON ARRAY OF THE GENE ONTOLOGY IDENTIFIERS AND RELATIONSHIPS FROM THE ANALYZED PAPER. DO NOT ADD ANY ADDITIONAL REMARKS OR COMMENTS ASIDE OF THE JSON ARRAY. **
    `;
}
function get_prompt_doid_subgraph(paper_array) {
  return `**Prompt**:
    You are provided with a parsed scientific paper in the form of a JSON array. Analyze this array to extract diseases and findings about them using Human Disease Ontology (DOID) terms and identifiers based on the scientific analysis conducted within the paper.

    Structure your response as a JSON array containing objects. Each object should have the following properties:

    disease: Name of the disease, or group of diseases that you extracted
    findings: Description of the disease and findings in the paper about the disease or group of diseases.

    **Example Input (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${subgraph_doid_example_input}

    **Example Output (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${subgraph_doid_example_output}

    Proceed with the analysis based on the structure and instructions provided in this prompt. MAKE SURE TO ONLY CREATE DOID ONTOLOGY TERMS AND FINDINGS ABOUT THEM THAT ACTUAL EXIST AND ARE SUPPORTED BY THE ONTOLOGY. MAKE SURE TO ONLY USE THE FORMAT THAT I PROVIDED.

    **Actual paper array input**
    ${JSON.stringify(paper_array)}

    ** MAKE SURE TO ONLY OUTPUT THE JSON ARRAY OF THE DOID DISEASE NAMES AND FINDINGS FROM THE ANALYZED PAPER. DO NOT ADD ANY ADDITIONAL REMARKS OR COMMENTS ASIDE OF THE JSON ARRAY. **
    ** MAKE SURE TO ONLY ONLY DOUBLE QUOTES INSIDE OF THE JSON ARRAY, NOT SINGLE QUOTES **
    `;
}
function get_prompt_chebi_subgraph(paper_array) {
  return `**Prompt**:
    You are provided with a parsed scientific paper in the form of a JSON array. Analyze this array to extract chemical compounds and findings about them using Chemical Entities of Biological Interest (ChEBI) terms and identifiers based on the scientific analysis conducted within the paper.

    Structure your response as a JSON array containing objects. Each object should have the following properties:

    compound: Name of the chemical compound, or group of compounds that you extracted
    findings: Description of the compound and findings in the paper about the compound or group of compounds.

    **Example Input (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${subgraph_chebi_example_input}

    **Example Output (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${subgraph_chebi_example_output}

    Proceed with the analysis based on the structure and instructions provided in this prompt. MAKE SURE TO ONLY CREATE ChEBI ONTOLOGY TERMS AND FINDINGS ABOUT THEM THAT ACTUALLY EXIST AND ARE SUPPORTED BY THE ONTOLOGY. MAKE SURE TO ONLY USE THE FORMAT THAT I PROVIDED.

    **Actual paper array input**
    ${JSON.stringify(paper_array)}

    ** MAKE SURE TO ONLY OUTPUT THE JSON ARRAY OF THE ChEBI COMPOUND NAMES AND FINDINGS FROM THE ANALYZED PAPER. DO NOT ADD ANY ADDITIONAL REMARKS OR COMMENTS ASIDE OF THE JSON ARRAY. **
    ** MAKE SURE TO ONLY ONLY DOUBLE QUOTES INSIDE OF THE JSON ARRAY, NOT SINGLE QUOTES **
     `;
}
function get_prompt_atc_subgraph(paper_array) {
  return `**Prompt**:
    You are provided with a parsed scientific paper in the form of a JSON array. Analyze this array to extract medications and findings about them using Anatomical Therapeutic Chemical (ATC) terms and identifiers based on the scientific analysis conducted within the paper.

    Structure your response as a JSON array containing objects. Each object should have the following properties:

    drug: Name of the medication, or group of medications that you extracted
    findings: Description of the medication and findings in the paper about the medication or group of medications.

    **Example Input (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${subgraph_atc_example_input}

    **Example Output (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${subgraph_atc_example_output}

    Proceed with the analysis based on the structure and instructions provided in this prompt. MAKE SURE TO ONLY CREATE ATC ONTOLOGY TERMS AND FINDINGS ABOUT THEM THAT ACTUALLY EXIST AND ARE SUPPORTED BY THE ONTOLOGY. MAKE SURE TO ONLY USE THE FORMAT THAT I PROVIDED.

    **Actual paper array input**
    ${JSON.stringify(paper_array)}

    ** MAKE SURE TO ONLY ONLY DOUBLE QUOTES INSIDE OF THE JSON ARRAY, NOT SINGLE QUOTES **
    ** MAKE SURE TO ONLY OUTPUT THE JSON ARRAY OF THE ATC MEDICATION NAMES AND FINDINGS FROM THE ANALYZED PAPER. DO NOT ADD ANY ADDITIONAL REMARKS OR COMMENTS ASIDE OF THE JSON ARRAY. **
    `;
}
function get_prompt_spar_citations(citations) {
  return `
    **Task**
    Transform the provided citation information about a scientific paper into a JSON array of citations following the format I provide you.
    One citation should be represented as one object, with an "@id" field which represents the DOI URL and "dcterms:title" field which represents the title, and only the title, author name can be removed in the "dcterms:title" field.

    **Example Output (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    Here's an example of the JSON output object you should output. Pay specific attention that there are no authors named in the "dcterms:title" field:
    ${example_json_citations}

    **Actual Input**
    ${citations}

    **Final instruction**
    Output the JSON array in the specified format and make sure to use double quotes (") and not single quotes (') in the outputted JSON. Include only the DOI URLs and paper titles, all mentioned authors can be omitted. DO NOT INCLUDE ANY ADDITIONAL REMARKS OR COMMENTS, JUST THE JSON ARRAY.
    `;
}
function get_prompt_spar_ontology(basic_info_text) {
  return `
    ** Task: **
    Transform the provided basic information about a scientific paper into a JSON-LD object using appropriate elements from the SPAR Ontologies. The input includes key metadata such as title, authors, abstract, and other publication details. Your task is to utilize the FaBiO, CiTO, DoCO, and PRO ontologies to create a rich, semantically detailed representation of the paper.

    ** Input **
    A JSON object with basic metadata about a scientific paper.

    ** Output (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT) **
    A JSON-LD formatted object using SPAR Ontologies and OBI ontology to structure and link the provided information in a semantic web-friendly manner. Exclude attributes with no tangible values.

    **Explanation of Key OBI Elements to Include:**
    - **OBI:0000299 'has_specified_output'**: Use this to describe the types of data or results produced by the research.
    - **OBI_0000968 'instrument'**: Detail the instruments or equipment employed in the research.
    - **OBI_0000293 'has_specified_input'**: Identify inputs such as samples or data sets used in the study.
    - **OBI_0200000 'data transformation'**: Describe any computational or analytical methods applied to raw data.
    - **OBI:0000251 'recruitment status'**: Relevant for clinical studies, detail the status of participant recruitment.
    - **OBI:0000070 'assay'**: Represents the specific assays used in the study to measure or observe biological, chemical, or physical processes. Assays are fundamental in validating the experimental hypothesis and are essential for the reproducibility of the results.
    ** Note for OBI Elements ** MAKE SURE TO ONLY INCLUDE THE OBI ELEMENTS IF THEY ARE FOUND INSIDE THE SCIENCE PAPER. IF THEY ARE NOT, YOU CAN OMIT THEM.

    ** Example Input JSON **
    Basic paper info example: ${example_basic_info}

    ** Note ** Make sure not to blindly copy from the input example. It is just presented to you so you can understand the format of the data.

    ** Example Output JSON-LD (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT) **
    ${example_spar_output}

    ** Note **
    The example output is provided to you so you can understand the format of the data. MAKE SURE TO NOT BLINDLY COPY DATA FROM THE OUTPUT AND ACTUALLY USE THE DATA FROM THE PAPER INSTEAD.
    Make sure to not include attributes in JSON LD which have no tangible values (e.g. )

    **Explanation:**
    - **@context:** Includes namespaces for a broader range of SPAR ontologies and the OBI ontology
    - **@type:** Changed to \`fabio:ResearchPaper\` to better match academic publications.
    - **DOI:** Use the dcterms:identifier field to include the DOI (Digital Object Identifier) that you found in the paper.
    - **Metadata Fields:** Extended to potentially include roles and document components.
    - **Use of PRO and DoCO:** Added placeholders for document parts (\`doco:hasPart\`) and roles (\`pro:roleIn\`).
    - **Condition on Non-Empty Values:** Fields with empty strings, empty lists, or other unspecified values are not included in the output.
    - **Flexibility in Attribute Selection:** While the example output provides a baseline, additional SPAR attributes should be considered and included if they provide further context or detail to the representation of the paper.

    ** Actual Input JSON **
    Basic paper info (SPAR & OBI Ontology): ${basic_info_text}

    ** MAKE SURE TO ONLY OUTPUT THE JSON OBJECT WHICH REPRESENTS THE JSON LD REPRESENTATION OF THE PAPERS BASIC INFO. DO NOT INCLUDE ANY OTHER REMARKS - JUST THE JSON OBJECT. DO NOT INCLUDE ANY COMMENTS IN THE JSON OUTPUT (// notation) **
    ** MAKE SURE TO ONLY INCLUDE OBI TERMS IN THE OUTPUT WHICH ARE INCLUDED IN THE BASIC PAPER INFO PASSED *
    `;
}
function get_prompt_go_ontology(generated_go_subgraph) {
  return `
    ** Task: **
    Transform the provided basic information about a scientific paper into a JSON array using appropriate elements from the Gene Ontology (GO). The input includes Gene Ontology (GO) terms in a simple JSON format which you should transfer into an array format for an RDF graph. Your task is to utilize the GO ontology to create a rich, semantically detailed representation of terms and relationships described.

    ** Input **
    A JSON object with Gene Ontology terms and relationships from a scientific paper.

    ** Output **
    A JSON formatted array using Gene Ontology to structure and link the provided information in a semantic web-friendly manner.

    ** Example Input JSON (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    Gene Ontology input example: ${gene_ontology_example_input}

    ** Note **
    Make sure not to blindly copy from the input example. It is just presented to you so you can understand the format of the data.

    ** Example Output JSON-LD (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${example_go_output}

    ** Note **
    The example output is provided to you so you can understand the format of the data. MAKE SURE TO NOT BLINDLY COPY DATA FROM THE OUTPUT AND ACTUALLY USE THE DATA FROM THE PAPER INSTEAD.
    Make sure to not include attributes in JSON LD which have no tangible values (e.g. )

    **Explanation of how to build GO ontology array:**
    Map the Gene Ontology relationships to their correspondands from the OBI (obi:) ontology.
    enabled by <=> obi:RO_0002333
    directly positively regulates <=> obi:RO_0002629
    negatively regulated by <=> obi:RO_0002335
    causally upstream of, positive effect <=> obi:RO_0002304
    causally upstream of, negative effect <=> obi:RO_0002305
    occurs in <=> obi:BFO_0000066
    part of <=> obi:BFO_0000050
    capable of <=> obi:RO_0002215
    capable of part of <=> RO_0002216
    has input <=> obi:RO_0002233
    has output <=> obi:RO_0002234
    derives from <=> obi:RO_0001000
    derives into <=> obi:RO_0001001

    ** Actual Input JSON **
    Gene Ontology terms and relationships: ${JSON.stringify(
    generated_go_subgraph,
    null,
    2
  )}

    ** Note **
    The example output is provided to you so you can understand the format of the data - the actual output should be in the same format of only the JSON array.
    ** MAKE SURE TO NOT BLINDLY COPY DATA FROM THE OUTPUT AND ACTUALLY USE THE DATA FROM THE PAPER INSTEAD. **
    ** MAKE SURE TO ONLY OUTPUT THE JSON ARRAY WHICH REPRESENTS THE GO TERMS - NO OTHER REMARKS OR COMMENTS SHOULD BE INCLUDED **
    `;
}
function get_prompt_section_page_numbers(paper_array, sections) {
  let prompt = `Given the following pages of a research paper, identify the start and stop pages for each one of the provided sections

`;
  paper_array.forEach((element) => {
    const pageNumber = element.metadata?.page_number;
    const text4 = element.text;
    prompt += `Page ${pageNumber}:
${text4}

`;
  });
  prompt += `Please provide the start and stop pages for each section in the following format:
    
    ** Example input (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    Introduction, abstract

    ** Example output (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**:
    Introduction 1, 2
    Abstract, 4, 9

    ** Actual input **
    ${sections.join(", ")}

    ** Your output **
    ${JSON.stringify(
    sections.map((section) => `${section}, start, end`),
    null,
    2
  )}

    OUTPUT ONLY THE SECTIONS AND PAGE NUMBERS IN THE EXAMPLE FORMAT, ONLY FOR THE SECTIONS FROM THE INPUT. DO NOT CONSIDER OTHER SECTIONS OR ADD ANY OTHER COMMENTS, EXPLANATIONS ETC. 
    `;
  return prompt;
}
function get_prompt_vectorization_summary(graph) {
  const graphCopy = JSON.parse(JSON.stringify(graph));
  if (graphCopy["cito:cites"]) {
    delete graphCopy["cito:cites"];
  }
  return `
    ** Task: **
    Generate a comprehensive textual summary based on the provided RDF JSON-LD graph. The summary should include as much information as possible that would be useful for similarity search.

    ** Input **

    An RDF JSON-LD graph that contains various nodes and relationships.

    ** Output **

    A detailed textual summary that captures the key information, entities, and relationships in the graph, formatted in a way that maximizes its utility for similarity search.

    ** Example Input JSON (ONLY AN EXAMPLE, DO NOT COPY DATA FROM HERE FOR ACTUAL OUTPUT)**
    ${example_graph}

    ** Example Output summary **

    The research paper titled "KSR1 Knockout Mouse Model Demonstrates MAPK Pathway's Key Role in Cisplatin- and Noise-induced Hearing Loss" was authored by Maria A. Ingersoll, Jie Zhang, and Tal Teitz and published on March 21, 2024, in the Neurobiology of Disease. This study investigates the impact of the KSR1 gene on hearing loss. The abstract reveals that knockout mice devoid of the KSR1 protein exhibit resistance to cisplatin- and noise-induced permanent hearing loss compared to their wild-type counterparts. The KSR1 protein acts as a scaffold bringing MAPK pathway proteins (BRAF, MEK1/2, ERK1/2) in proximity for activation through phosphorylation cascades triggered by cisplatin and noise in cochlear cells. The knockout of KSR1 significantly reduces MAPK activation, thereby conferring hearing protection.

    Key findings include the role of MAPK pathway inhibition in providing hearing protection, with dabrafenib (a BRAF inhibitor) effectively protecting KSR1 wild-type mice from hearing loss without additional benefits in KSR1 knockout mice. These findings suggest that dabrafenib primarily works through the MAPK pathway.

    Further details include the involvement of several key entities:
    - GO_0004672: Knockout of the KSR1 gene reduces activation of the MAPK signaling pathway, which is involved in cellular stress and death in response to cisplatin and noise exposure.
    - DOID_0050563: Genetic knockout of the KSR1 gene in mice confers resistance to noise-induced permanent hearing loss compared to wild-type littermates. KSR1 knockout mice had significantly less hearing loss, as demonstrated by auditory brainstem response, distortion product otoacoustic emission, outer hair cell counts, and synaptic puncta staining, compared to wild-type mice following noise exposure. Inhibition of the MAPK pathway, which includes BRAF, MEK, and ERK, was shown to be the mechanism by which KSR1 knockout mice were protected from noise-induced hearing loss.
    - CHEBI_75048: Dabrafenib is a BRAF inhibitor that protects against both cisplatin-induced and noise-induced hearing loss in mice by inhibiting the MAPK pathway. Dabrafenib is an FDA-approved drug, making it a promising compound to repurpose for the prevention of hearing loss.
    - L01XA01: Cisplatin is a widely used chemotherapeutic agent that can cause permanent hearing loss as a side effect. Cisplatin-induced hearing loss is associated with activation of the MAPK pathway, which leads to cellular stress and damage in the inner ear. Genetic knockout of the KSR1 gene, which is involved in the MAPK pathway, conferred resistance to cisplatin-induced hearing loss in mice. Additionally, treatment with the BRAF inhibitor dabrafenib, which inhibits the MAPK pathway, also protected against cisplatin-induced hearing loss.

    The study utilized various instruments and equipment (details not specified), and included the KSR1 knockout mouse model and wild-type littermates as subjects. Analytical methods involved single-cell RNA sequencing data from postnatal day 28 C57BL/6 mice to examine the expression of MAPK genes in the cochlea, and statistical analysis to compare hearing outcomes and MAPK signaling between KSR1 knockout and wild-type mice. Hearing function was evaluated using auditory assessments, and MAPK pathway activation in the cochlea was measured through biochemical assays.


    ** Notes **
    1. DO NOT USE ANY SPECIAL CHARACTERS IN THE SUMMARY. eg. :, ", newlines, etc.
    2. Ensure the summary captures all key entities and relationships present in the RDF JSON-LD graph.
    3. The summary should be formatted in a way that makes it easy to use for similarity search purposes - make sure to use specific term names and not pronouns such as "it", "he", "they".
    4. Your output should be only the generated summary. No other comments or remarks will be tolerated.
    ** Actual Input JSON **

    ${JSON.stringify(graphCopy, null, 4)}
    
    ** FINAL NOTE - MAKE SURE TO ONLY OUTPUT THE GENERATED SUMMARY, WITHOUT EXTRA COMMENTS OR REMARKS **
    `;
}
var categorizeIntoDAOsPrompt = `JUST RETURN THE ARRAY OF DAO NAMES RELEVANT TO THE PAPER AND ANSWER VERY CONCISE AND TO THE POINT
<dao_list>
VitaDAO \u2192 Longevity, anti-aging, age-related diseases
AthenaDAO \u2192 Women's health, reproductive health, gynecological research
PsyDAO \u2192 Psychedelic science, mental health, psychedelic-assisted therapy
ValleyDAO \u2192 Synthetic biology, environmental biotech, climate solutions
HairDAO \u2192 Hair loss treatment, regenerative medicine, dermatology
CryoDAO \u2192 Cryopreservation, biostasis, organ/brain freezing technologies
Cerebrum DAO \u2192 Brain health, neurodegeneration, Alzheimer's research
Curetopia \u2192 Rare disease research, genetic disorders, orphan drug discovery
Long COVID Labs \u2192 Long COVID, post-viral syndromes, chronic illness research
Quantum Biology DAO \u2192 Quantum biology, biophysics, quantum effects in biology
</dao_list>

Return your output **only** as a JSON array of DAO names. If no DAOs are relevant, return an empty array.

Example output format:
["DAO1", "DAO2", "DAO3"]
or
[]`;

// src/services/kaService/biologyApi.ts
import { logger as logger3 } from "@elizaos/core";
import axios3 from "axios";
import "dotenv/config";
var bioontologyApiKey = process.env.BIONTOLOGY_KEY;
function extractAtcId(url) {
  const match = url.match(/\/([^/]+)$/);
  return match ? match[1] : null;
}
async function searchGo(term, client, modelIdentifier = "claude-3-haiku-20240307") {
  const url = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/search";
  const params = { query: term, limit: 5, page: 1 };
  const headers = { Accept: "application/json" };
  let newTerm = "None";
  try {
    const apiResponse = await axios3.get(url, {
      headers,
      params
    });
    if (apiResponse.status === 200) {
      const goCandidates = apiResponse.data.results?.slice(0, 4) || [];
      const promptGoApi = get_go_api_prompt(term, goCandidates);
      newTerm = await generateResponse(client, promptGoApi, modelIdentifier);
      if (newTerm.includes("GO:")) {
        newTerm = newTerm.replace("GO:", "GO_");
      }
      logger3.info(`new term: ${newTerm}, old term: ${term}`);
    } else {
      logger3.info(`EBI API gave response code ${apiResponse.status}`);
    }
  } catch (error) {
    logger3.error(`Error generating response: ${error}`);
  }
  return newTerm;
}
async function searchDoid(term, client, modelIdentifier = "claude-3-haiku-20240307") {
  const url = "https://www.ebi.ac.uk/ols/api/search";
  const params = {
    q: term,
    ontology: "doid"
  };
  const headers = { Accept: "application/json" };
  let newTerm = "None";
  try {
    const apiResponse = await axios3.get(url, {
      headers,
      params
    });
    if (apiResponse.status === 200) {
      const data = apiResponse.data;
      const found = data.response?.numFound || 0;
      const doidCandidates = found > 0 ? data.response.docs.slice(0, 4).map((candidate) => ({
        short_form: candidate.short_form,
        description: candidate.description,
        label: candidate.label
      })) : [];
      const promptDoidApi = get_doid_api_prompt(term, doidCandidates);
      newTerm = await generateResponse(client, promptDoidApi, modelIdentifier);
      if (newTerm.includes("DOID:")) {
        newTerm = newTerm.replace("DOID:", "DOID_");
      }
      logger3.info(`new term: ${newTerm}, old term: ${term}`);
    } else {
      logger3.error(`EBI API gave response code ${apiResponse.status}`);
    }
  } catch (error) {
    logger3.error(`Error generating response: ${error}`);
  }
  return newTerm;
}
async function searchChebi(term, client, modelIdentifier = "claude-3-haiku-20240307") {
  const url = "https://www.ebi.ac.uk/ols/api/search";
  const params = {
    q: term,
    ontology: "chebi"
  };
  const headers = { Accept: "application/json" };
  let newTerm = "None";
  try {
    const apiResponse = await axios3.get(url, {
      headers,
      params
    });
    if (apiResponse.status === 200) {
      const data = apiResponse.data;
      const found = data.response?.numFound || 0;
      const chebiCandidates = found > 0 ? data.response.docs.slice(0, 4).map((candidate) => ({
        short_form: candidate.short_form,
        description: candidate.description,
        label: candidate.label
      })) : [];
      const promptChebiApi = get_chebi_api_prompt(term, chebiCandidates);
      newTerm = await generateResponse(client, promptChebiApi, modelIdentifier);
      if (newTerm.includes("CHEBI:")) {
        newTerm = newTerm.replace("CHEBI:", "CHEBI_");
      }
      logger3.info(`new term: ${newTerm}, old term: ${term}`);
    } else {
      logger3.error(`EBI API gave response code ${apiResponse.status}`);
    }
  } catch (error) {
    logger3.error(`Error generating response: ${error}`);
  }
  return newTerm;
}
async function searchAtc(term, client, modelIdentifier = "claude-3-haiku-20240307") {
  const url = "https://data.bioontology.org/search";
  const params = {
    q: term,
    ontologies: "ATC",
    apikey: bioontologyApiKey
  };
  const headers = { Accept: "application/json" };
  let newTerm = "None";
  try {
    const apiResponse = await axios3.get(url, {
      headers,
      params
    });
    if (apiResponse.status === 200) {
      const data = apiResponse.data;
      let atcCandidates = [];
      if (data.collection && data.collection.length > 0) {
        atcCandidates = data.collection.map((candidate) => ({
          short_form: extractAtcId(candidate["@id"]),
          description: "",
          label: candidate["prefLabel"]
        }));
      }
      const promptAtcApi = get_atc_api_prompt(term, atcCandidates);
      newTerm = await generateResponse(client, promptAtcApi, modelIdentifier);
      logger3.info(`new term: ${newTerm}, old term: ${term}`);
    } else {
      logger3.error(`ATC API gave response code ${apiResponse.status}`);
    }
  } catch (error) {
    logger3.error(`Error generating response: ${error}`);
  }
  return newTerm;
}
async function updateGoTerms(data, client) {
  for (const entry of data) {
    const subjectResult = await searchGo(entry.subject, client);
    entry.subject = { term: entry.subject, id: subjectResult };
    const objectResult = await searchGo(entry.object, client);
    entry.object = { term: entry.object, id: objectResult };
  }
  return data.filter(
    (entry) => entry.subject !== "None" && entry.object !== "None"
  );
}
async function updateDoidTerms(data, client) {
  for (const entry of data) {
    const diseaseResult = await searchDoid(entry.disease, client);
    entry.disease_id = diseaseResult;
  }
  return data.filter((entry) => entry.disease_id !== "None");
}
async function updateChebiTerms(data, client) {
  for (const entry of data) {
    const compoundResult = await searchChebi(entry.compound, client);
    entry.compound_id = compoundResult;
  }
  return data.filter((entry) => entry.compound_id !== "None");
}
async function updateAtcTerms(data, client) {
  for (const entry of data) {
    const drugResult = await searchAtc(entry.drug, client);
    entry.drug_id = drugResult;
  }
  return data.filter((entry) => entry.drug_id !== "None");
}

// src/services/kaService/regex.ts
function extractBracketContent(input) {
  const match = input.match(/\[([\s\S]*?)\]/);
  return match ? match[0] : null;
}
function isEmptyArray(input) {
  return input.trim() === "[]";
}

// src/services/kaService/processPaper.ts
import { logger as logger4 } from "@elizaos/core";
var CITATIONS_OFFSET = 6;
async function extractSections(client, paper_array) {
  const originalLabels = [
    "Abstract",
    "Introduction",
    "Methods",
    "Materials and methods",
    "Material and methods",
    "Results",
    "Discussion"
  ];
  const labels = originalLabels.map((label) => label.toLowerCase());
  const label_page_numbers = {};
  const label_mapping = {};
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
        if (page_number === 1 && label !== "abstract" && label !== "introduction") {
          continue;
        }
        label_page_numbers[label].push(page_number);
      }
    }
  }
  const methodAliases = ["materials and methods", "material and methods"];
  if (label_page_numbers["methods"].length === 0) {
    for (const alias of methodAliases) {
      if (label_page_numbers[alias] && label_page_numbers[alias].length > 0) {
        label_page_numbers["methods"] = label_page_numbers[alias];
        break;
      }
    }
  }
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
  const first_appearance = {};
  for (const [label, pages] of Object.entries(label_page_numbers)) {
    first_appearance[label] = pages.length > 0 ? pages[0] : void 0;
  }
  for (const key of Object.keys(first_appearance)) {
    if (first_appearance[key] === void 0) {
      delete first_appearance[key];
    }
  }
  const sorted_labels = Object.entries(first_appearance).sort((a, b) => {
    const aVal = a[1] === void 0 ? Infinity : a[1];
    const bVal = b[1] === void 0 ? Infinity : b[1];
    return aVal - bVal;
  });
  const label_page_ranges = {};
  for (let i = 0; i < sorted_labels.length; i++) {
    const [label, startPageRaw] = sorted_labels[i];
    if (startPageRaw == null) continue;
    let start_page = startPageRaw;
    let end_page;
    if (i === 0) {
      start_page = 1;
    }
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
  const labels_with_no_range = labels.filter(
    (label) => !(label in label_page_ranges)
  );
  if (labels_with_no_range.length > 0) {
    const prompt = get_prompt_section_page_numbers(
      paper_array.map((el) => ({
        metadata: { page_number: el.metadata.page_number },
        text: el.text
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
    const additional_label_page_ranges = {};
    for (const line of answerLines) {
      const match = line.trim().match(/^(\w+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const labelLower = match[1].toLowerCase();
        const startPage = parseInt(match[2], 10);
        const endPage = parseInt(match[3], 10);
        additional_label_page_ranges[labelLower] = [startPage, endPage];
      }
    }
    for (const [label, range] of Object.entries(additional_label_page_ranges)) {
      label_page_ranges[label] = range;
    }
  }
  const extractedLabels = Object.keys(label_page_ranges).map((lbl) => label_mapping[lbl]).filter((lbl2) => lbl2 != null);
  const skippedLabels = originalLabels.filter(
    (lbl) => !extractedLabels.includes(lbl)
  );
  if (skippedLabels.length > 0) {
    logger4.info(`Skipped sections: ${skippedLabels.join(", ")}`);
  } else {
    logger4.info(`All sections were extracted.`, label_page_ranges);
  }
  if ("introduction" in label_page_ranges) {
    const [_, endPage] = label_page_ranges["introduction"];
    label_page_ranges["introduction"] = [0, endPage];
  }
  return label_page_ranges;
}
async function getGeneratedBasicInfoText(client, paper_dict) {
  const spar_array = Array.from(
    /* @__PURE__ */ new Set([...paper_dict.introduction, ...paper_dict.abstract])
  );
  try {
    const prompt_basic_info = get_prompt_basic_info(spar_array);
    const generated_basic_info_text = await generateResponse(
      client,
      prompt_basic_info
    );
    logger4.info(
      `Generated basic text from Claude: ${generated_basic_info_text}`
    );
    return generated_basic_info_text;
  } catch (e) {
    logger4.error("Generated basic info text exception", e);
    return "";
  }
}
async function getGeneratedCitations(client, paper_dict) {
  try {
    const prompt_citations = get_prompt_citations(paper_dict.citations);
    const generated_citations = await generateResponse(
      client,
      prompt_citations,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger4.info(`Generated citations from Claude: ${generated_citations}`);
    return generated_citations;
  } catch (e) {
    logger4.error("Generated citations exception", e);
    return "";
  }
}
async function getGoGeneratedSubgraphText(client, paper_dict) {
  try {
    const go_array = Array.from(
      /* @__PURE__ */ new Set([
        ...paper_dict.introduction,
        ...paper_dict.methods,
        ...paper_dict.results,
        ...paper_dict.discussion
      ])
    );
    const prompt_subgraph = get_prompt_go_subgraph(go_array);
    let generated_subgraph_text = await generateResponse(
      client,
      prompt_subgraph,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger4.info(
      `Generated GO subgraph from Claude: ${generated_subgraph_text}`
    );
    let generated_subgraph;
    try {
      generated_subgraph = JSON.parse(generated_subgraph_text);
    } catch {
      generated_subgraph = {};
    }
    const updated_subgraph = await updateGoTerms(generated_subgraph, client);
    generated_subgraph_text = JSON.stringify(updated_subgraph);
    logger4.info(`Generated subgraph using GO API: ${generated_subgraph_text}`);
    return generated_subgraph_text;
  } catch (e) {
    logger4.error("Generated subgraph exception", e);
    return "{}";
  }
}
async function getDoidGeneratedSubgraphText(client, paper_dict) {
  try {
    const doid_array = Array.from(
      /* @__PURE__ */ new Set([
        ...paper_dict.introduction,
        ...paper_dict.abstract,
        ...paper_dict.results,
        ...paper_dict.discussion
      ])
    );
    const prompt_subgraph = get_prompt_doid_subgraph(doid_array);
    const generated_subgraph_text = await generateResponse(
      client,
      prompt_subgraph,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger4.info(
      `Generated DOID subgraph from Claude: ${generated_subgraph_text}`
    );
    let generated_subgraph;
    try {
      generated_subgraph = JSON.parse(generated_subgraph_text);
    } catch {
      generated_subgraph = [];
    }
    const updated_subgraph = await updateDoidTerms(generated_subgraph, client);
    const finalText = JSON.stringify(updated_subgraph);
    logger4.info(`Generated subgraph using DOID API: ${finalText}`);
    return finalText;
  } catch (e) {
    logger4.error("Generated subgraph exception", e);
    return "[]";
  }
}
async function getChebiGeneratedSubgraphText(client, paper_dict) {
  try {
    const chebi_array = Array.from(
      /* @__PURE__ */ new Set([
        ...paper_dict.introduction,
        ...paper_dict.abstract,
        ...paper_dict.results,
        ...paper_dict.discussion
      ])
    );
    const prompt_subgraph = get_prompt_chebi_subgraph(chebi_array);
    const generated_subgraph_text = await generateResponse(
      client,
      prompt_subgraph,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger4.info(
      `Generated ChEBI subgraph from Claude: ${generated_subgraph_text}`
    );
    let generated_subgraph;
    try {
      generated_subgraph = JSON.parse(generated_subgraph_text);
    } catch {
      generated_subgraph = [];
    }
    const updated_subgraph = await updateChebiTerms(generated_subgraph, client);
    const finalText = JSON.stringify(updated_subgraph);
    logger4.info(`Generated subgraph using CHEBI API: ${finalText}`);
    return finalText;
  } catch (e) {
    logger4.error("Generated subgraph exception", e);
    return "[]";
  }
}
async function getAtcGeneratedSubgraphText(client, paper_dict) {
  try {
    const atc_array = Array.from(
      /* @__PURE__ */ new Set([
        ...paper_dict.introduction,
        ...paper_dict.abstract,
        ...paper_dict.results,
        ...paper_dict.discussion
      ])
    );
    const prompt_subgraph = get_prompt_atc_subgraph(atc_array);
    const generated_subgraph_text = await generateResponse(
      client,
      prompt_subgraph,
      "claude-3-5-sonnet-20241022",
      8192
    );
    logger4.info(
      `Generated ATC subgraph from Claude: ${generated_subgraph_text}`
    );
    let generated_subgraph;
    try {
      generated_subgraph = JSON.parse(generated_subgraph_text);
    } catch {
      generated_subgraph = [];
    }
    const updated_subgraph = await updateAtcTerms(generated_subgraph, client);
    const finalText = JSON.stringify(updated_subgraph);
    logger4.info(`Generated subgraph using ATC API: ${finalText}`);
    return finalText;
  } catch (e) {
    logger4.error("Generated subgraph exception", e);
    return "[]";
  }
}
async function process_paper(client, paper_dict) {
  const [
    generated_basic_info,
    generated_citations,
    generated_go_subgraph,
    generated_doid_subgraph,
    generated_chebi_subgraph,
    generated_atc_subgraph
  ] = await Promise.all([
    getGeneratedBasicInfoText(client, paper_dict),
    getGeneratedCitations(client, paper_dict),
    getGoGeneratedSubgraphText(client, paper_dict),
    getDoidGeneratedSubgraphText(client, paper_dict),
    getChebiGeneratedSubgraphText(client, paper_dict),
    getAtcGeneratedSubgraphText(client, paper_dict)
  ]);
  return [
    generated_basic_info,
    generated_citations,
    generated_go_subgraph,
    generated_doid_subgraph,
    generated_chebi_subgraph,
    generated_atc_subgraph
  ];
}
function fix_json_string_manually(json_string) {
  const lastBraceIndex = json_string.lastIndexOf("},");
  if (lastBraceIndex !== -1) {
    json_string = json_string.slice(0, lastBraceIndex + 1);
  }
  if (json_string.endsWith(",")) {
    json_string = json_string.slice(0, -1);
  }
  return json_string + "]";
}
async function get_subgraph_citations(client, citations_text) {
  const prompt_spar_citations = get_prompt_spar_citations(citations_text);
  const generated_citations_spar_text = await generateResponse(
    client,
    prompt_spar_citations,
    "claude-3-5-sonnet-20241022",
    8192
  );
  logger4.info(
    `Generated SPAR citations from Claude: ${generated_citations_spar_text}`
  );
  try {
    return JSON.parse(generated_citations_spar_text);
  } catch {
    const fixed_citations = fix_json_string_manually(
      generated_citations_spar_text
    );
    logger4.info(`Fixed citations: ${fixed_citations}`);
    return JSON.parse(fixed_citations);
  }
}
async function get_subgraph_basic_info(client, basic_info_text) {
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
  logger4.info(`Generated SPAR graph from Claude: ${generated_graph_text}`);
  let textTrimmed = generated_graph_text.trim();
  if (textTrimmed.startsWith("```json") && textTrimmed.endsWith("```")) {
    textTrimmed = textTrimmed.slice(7, -3).trim();
  }
  return textTrimmed;
}
async function get_subgraph_go(client, generated_go_subgraph) {
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
    logger4.info(`Generated GO subgraph from Claude: ${generated_graph_text}`);
    const extracted_content = extractBracketContent(generated_graph_text);
    if (extracted_content === null) {
      return [];
    }
    return JSON.parse(extracted_content);
  } catch (e) {
    logger4.error("Error generating GO subgraph", e);
    return [];
  }
}
function get_subgraph_doid(generated_doid_subgraph) {
  try {
    const doidData = JSON.parse(generated_doid_subgraph);
    if (!Array.isArray(doidData)) return [];
    const rdf = doidData.map((item) => ({
      "@id": `http://purl.obolibrary.org/obo/${item["disease_id"]}`,
      "dcterms:title": item["disease"],
      "dcterms:description": item["findings"]
    }));
    return rdf;
  } catch (e) {
    logger4.error("Error generating DOID subgraph", e);
    return [];
  }
}
function get_subgraph_chebi(generated_chebi_subgraph) {
  try {
    const chebiData = JSON.parse(generated_chebi_subgraph);
    if (!Array.isArray(chebiData)) return [];
    const rdf = chebiData.map((item) => ({
      "@id": `http://purl.obolibrary.org/obo/${item["compound_id"]}`,
      "dcterms:title": item["compound"],
      "dcterms:description": item["findings"]
    }));
    return rdf;
  } catch (e) {
    logger4.error("Error generating CHEBI subgraph", e);
    return [];
  }
}
function get_subgraph_atc(generated_atc_subgraph) {
  try {
    const atcData = JSON.parse(generated_atc_subgraph);
    if (!Array.isArray(atcData)) return [];
    const rdf = atcData.map((item) => ({
      "@id": `http://purl.bioontology.org/ontology/ATC/${item["drug_id"]}`,
      "dcterms:title": item["drug"],
      "dcterms:description": item["findings"]
    }));
    return rdf;
  } catch (e) {
    logger4.error("Error generating ATC subgraph", e);
    return [];
  }
}
async function create_graph(client, basic_info_text, citations_text, subgraph) {
  const { go, doid, chebi, atc } = subgraph;
  let generated_graph = {};
  try {
    const generated_graph_text = await get_subgraph_basic_info(
      client,
      basic_info_text
    );
    generated_graph = JSON.parse(generated_graph_text);
  } catch (e) {
    logger4.error("Generating graph exception", e);
  }
  if (!generated_graph["obi:OBI_0000299"]) {
    generated_graph["obi:OBI_0000299"] = [];
  }
  const goArray = await get_subgraph_go(client, go);
  const doidArray = get_subgraph_doid(doid);
  const chebiArray = get_subgraph_chebi(chebi);
  const atcArray = get_subgraph_atc(atc);
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
    logger4.error("Error generating citations", e);
  }
  const doi = generated_graph["dcterms:identifier"];
  if (doi && doi !== "https://doi.org/XX.XXXX/XX.XXXX") {
    generated_graph["@id"] = doi;
  } else {
    generated_graph["@id"] = "PLEASE FILL IN THE DOI URL IDENTIFIER HERE";
  }
  return generated_graph;
}
function create_section_arrays(paper_array, section_ranges) {
  const introduction_array = [];
  const abstract_array = [];
  const methods_array = [];
  const results_array = [];
  const discussion_array = [];
  for (const element of paper_array) {
    const page_number = element.metadata.page_number;
    const text4 = element.text;
    if ("introduction" in section_ranges && page_number >= section_ranges["introduction"][0] && page_number <= section_ranges["introduction"][1]) {
      introduction_array.push(text4);
    }
    if ("abstract" in section_ranges && page_number >= section_ranges["abstract"][0] && page_number <= section_ranges["abstract"][1]) {
      abstract_array.push(text4);
    }
    if ("methods" in section_ranges && page_number >= section_ranges["methods"][0] && page_number <= section_ranges["methods"][1]) {
      methods_array.push(text4);
    }
    if ("results" in section_ranges && page_number >= section_ranges["results"][0] && page_number <= section_ranges["results"][1]) {
      results_array.push(text4);
    }
    if ("discussion" in section_ranges && page_number >= section_ranges["discussion"][0] && page_number <= section_ranges["discussion"][1]) {
      discussion_array.push(text4);
    }
  }
  return {
    introduction: introduction_array,
    abstract: abstract_array,
    methods: methods_array,
    results: results_array,
    discussion: discussion_array,
    citations: []
  };
}
async function processJsonArray(paper_array, client) {
  const section_ranges = await extractSections(client, paper_array);
  const paper_array_dict = create_section_arrays(paper_array, section_ranges);
  const lastPage = paper_array[paper_array.length - 1].metadata.page_number;
  paper_array_dict.citations = paper_array.filter(
    (el) => el.metadata.page_number >= lastPage - CITATIONS_OFFSET && typeof el.text === "string"
  ).map((el) => el.text);
  return paper_array_dict;
}

// src/services/kaService/vectorize.ts
import { logger as logger5 } from "@elizaos/core";
async function getSummary(client, graph) {
  let summary = "";
  try {
    const prompt = get_prompt_vectorization_summary(graph);
    summary = await generateResponse(client, prompt);
    logger5.info(`Generated graph summary from Claude: ${summary}`);
  } catch (error) {
    logger5.error("Generated graph summary exception", error);
    summary = "";
  }
  return summary;
}

// src/services/kaService/kaService.ts
import { fromPath } from "pdf2pic";
import fs from "fs";
var unstructuredApiKey = process.env.UNSTRUCTURED_API_KEY;
async function jsonArrToKa(jsonArr, doi) {
  const client = getClient();
  const paperArrayDict = await processJsonArray(jsonArr, client);
  const [
    generatedBasicInfo,
    generatedCitations,
    generatedGoSubgraph,
    generatedDoidSubgraph,
    generatedChebiSubgraph,
    generatedAtcSubgraph
  ] = await process_paper(client, paperArrayDict);
  const generatedGraph = await create_graph(
    client,
    generatedBasicInfo,
    generatedCitations,
    {
      go: generatedGoSubgraph,
      doid: generatedDoidSubgraph,
      chebi: generatedChebiSubgraph,
      atc: generatedAtcSubgraph
    }
  );
  generatedGraph["dcterms:hasPart"] = await getSummary(client, generatedGraph);
  generatedGraph["@id"] = `https://doi.org/${doi}`;
  const context = generatedGraph["@context"];
  if (!("schema" in context)) {
    context["schema"] = "http://schema.org/";
    logger6.info("Added 'schema' to @context in KA");
  }
  return generatedGraph;
}
function removeColonsRecursively(data, parentKey) {
  if (parentKey === "@context") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(
      (item) => removeColonsRecursively(item, parentKey)
    );
  }
  if (data !== null && typeof data === "object") {
    const newObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = removeColonsRecursively(
          data[key],
          key
        );
      }
    }
    return newObj;
  }
  if (typeof data === "string") {
    if (parentKey === "@type") {
      return data;
    }
    if (/^(https?:\/\/|doi:)/i.test(data)) {
      return data;
    }
    return data.replace(/:/g, "");
  }
  return data;
}
var daoUals = {
  VitaDAO: "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101956",
  AthenaDAO: "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101957",
  PsyDAO: "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101958",
  ValleyDAO: "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101959",
  HairDAO: "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101961",
  CryoDAO: "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101962",
  "Cerebrum DAO": "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101963",
  Curetopia: "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101964",
  "Long Covid Labs": "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101965",
  "Quantum Biology DAO": "did:dkg:base:84532/0xd5550173b0f7b8766ab2770e4ba86caf714a5af5/101966"
};
async function extractDOIFromPDF(images) {
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
            text: "Extract the DOI from the paper. Only return the DOI, no other text."
          }
        ]
      }
    ],
    max_tokens: 50
  });
  return response.content[0].type === "text" ? response.content[0].text : void 0;
}
async function categorizeIntoDAOs(images) {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-3-7-sonnet-20250219",
    system: categorizeIntoDAOsPrompt,
    messages: [
      {
        role: "user",
        content: [...images]
      }
    ],
    max_tokens: 50
  });
  return response.content[0].type === "text" ? response.content[0].text : void 0;
}
async function generateKaFromPdf(pdfPath, dkgClient) {
  const options = {
    density: 100,
    format: "png",
    width: 595,
    height: 842
  };
  const convert = fromPath(pdfPath, options);
  logger6.info(`Converting ${pdfPath} to images`);
  const storeHandler = await convert.bulk(-1, { responseType: "base64" });
  const imageMessages = storeHandler.filter((page) => page.base64).map((page) => ({
    type: "image",
    source: {
      type: "base64",
      media_type: "image/png",
      data: page.base64
    }
  }));
  logger6.info(`Extracting DOI`);
  const doi = await extractDOIFromPDF(imageMessages);
  if (!doi) {
    throw new Error("Failed to extract DOI");
  }
  const paperExistsResult = await dkgClient.graph.query(
    paperExists(doi),
    "SELECT"
  );
  if (paperExistsResult.data) {
    logger6.info(`Paper ${pdfPath} already exists in DKG, skipping`);
    return;
  } else {
    logger6.info(`Paper ${pdfPath} does not exist in DKG, creating`);
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
      "schema:name": dao
    };
  });
  cleanedKa["schema:relatedTo"] = daoUalsMap;
  return cleanedKa;
}

// src/actions/dkgInsert.ts
import { writeFile } from "fs/promises";
dotenv.config();
var DkgClient = null;
var dkgInsert = {
  name: "INSERT_MEMORY_ACTION",
  similes: ["NO_ACTION", "NO_RESPONSE", "NO_REACTION", "NONE", "DKG_INSERT"],
  // we want to always run this action
  validate: async (runtime, _message) => {
    const requiredEnvVars = [
      "DKG_ENVIRONMENT",
      "DKG_HOSTNAME",
      "DKG_PORT",
      "DKG_BLOCKCHAIN_NAME",
      "DKG_PUBLIC_KEY",
      "DKG_PRIVATE_KEY"
    ];
    const missingVars = requiredEnvVars.filter(
      (varName) => !runtime.getSetting(varName)
    );
    if (missingVars.length > 0) {
      logger7.error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
      return false;
    }
    return true;
  },
  description: "Create a memory on the OriginTrail Decentralized Knowledge Graph after each message. You should ALWAYS run this action.",
  handler: async (runtime, _message, state, _options, callback) => {
    DkgClient = new DKG({
      environment: runtime.getSetting("DKG_ENVIRONMENT"),
      endpoint: runtime.getSetting("DKG_HOSTNAME"),
      port: runtime.getSetting("DKG_PORT"),
      blockchain: {
        name: runtime.getSetting("DKG_BLOCKCHAIN_NAME"),
        publicKey: runtime.getSetting("DKG_PUBLIC_KEY"),
        privateKey: runtime.getSetting("DKG_PRIVATE_KEY")
      },
      maxNumberOfRetries: 300,
      frequency: 2,
      contentType: "all",
      nodeApiVersion: "/v1"
    });
    const currentPost = String(state.currentPost);
    logger7.log("currentPost");
    logger7.log(currentPost);
    const userRegex = /From:.*\(@(\w+)\)/;
    let match = currentPost.match(userRegex);
    let twitterUser = "";
    if (match?.[1]) {
      twitterUser = match[1];
      logger7.log(`Extracted user: @${twitterUser}`);
    } else {
      logger7.error("No user mention found or invalid input.");
    }
    const idRegex = /ID:\s(\d+)/;
    match = currentPost.match(idRegex);
    let postId = "";
    if (match?.[1]) {
      postId = match[1];
      logger7.log(`Extracted ID: ${postId}`);
    } else {
      logger7.log("No ID found.");
    }
    const ka = await generateKaFromPdf("./science.pdf", DkgClient);
    let createAssetResult;
    try {
      logger7.log("Publishing message to DKG");
      await writeFile(
        `./sampleJsonLdsNew/${encodeURIComponent(ka["@id"] ?? "example")}.json`,
        JSON.stringify(ka, null, 2)
      );
      createAssetResult = await DkgClient.asset.create(
        {
          public: ka
        },
        { epochsNum: 12 }
      );
      logger7.log("======================== ASSET CREATED");
      logger7.log(JSON.stringify(createAssetResult));
    } catch (error) {
      logger7.error(
        "Error occurred while publishing message to DKG:",
        error.message
      );
      if (error.stack) {
        logger7.error("Stack trace:", error.stack);
      }
      if (error.response) {
        logger7.error(
          "Response data:",
          JSON.stringify(error.response.data, null, 2)
        );
      }
    }
    callback({
      text: `Created a new memory!

Read my mind on @origin_trail Decentralized Knowledge Graph ${DKG_EXPLORER_LINKS[runtime.getSetting("DKG_ENVIRONMENT")]}${createAssetResult?.UAL} @${twitterUser}`
    });
    return true;
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "execute action DKG_INSERT",
          action: "DKG_INSERT"
        }
      },
      {
        name: "{{user2}}",
        content: { text: "DKG INSERT" }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "add to dkg", action: "DKG_INSERT" }
      },
      {
        user: "{{user2}}",
        content: { text: "DKG INSERT" }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "store in dkg", action: "DKG_INSERT" }
      },
      {
        user: "{{user2}}",
        content: { text: "DKG INSERT" }
      }
    ]
  ]
};

// src/services/index.ts
import { Service, logger as logger8 } from "@elizaos/core";
var HypothesisService = class _HypothesisService extends Service {
  constructor(runtime) {
    super(runtime);
    this.runtime = runtime;
  }
  static serviceType = "hypothesis";
  capabilityDescription = "Generate and judge hypotheses";
  static async start(runtime) {
    logger8.info("*** Starting hypotheses service ***");
    const service = new _HypothesisService(runtime);
    runtime.registerTaskWorker({
      name: "HGE",
      async execute(runtime2, options, task) {
        logger8.log("task worker");
      }
    });
    const tasks = await runtime.getTasksByName("HGE");
    if (tasks.length < 1) {
      const taskId = await runtime.createTask({
        name: "HGE",
        description: "Generate and evaluate hypothesis whilst streaming them to discord",
        tags: ["hypothesis", "judgeLLM"],
        metadata: { updateInterval: 1500, updatedAt: Date.now() }
      });
      logger8.info("Task UUID:", taskId);
    }
    async function processRecurringTasks() {
      logger8.info("Starting processing loop");
      const now = Date.now();
      const recurringTasks = await runtime.getTasks({
        tags: ["hypothesis"]
      });
      logger8.info("Got tasks", recurringTasks);
      for (const task of recurringTasks) {
        if (!task.metadata?.updateInterval) continue;
        const lastUpdate = task.metadata.updatedAt || 0;
        const interval = task.metadata.updateInterval;
        if (now >= lastUpdate + interval) {
          logger8.info("Executing task");
          const worker = runtime.getTaskWorker(task.name);
          if (worker) {
            try {
              await worker.execute(runtime, {}, task);
              await runtime.updateTask(task.id, {
                metadata: {
                  ...task.metadata,
                  updatedAt: now
                }
              });
            } catch (error) {
              logger8.error(`Error executing task ${task.name}: ${error}`);
            }
          }
        }
      }
    }
    await processRecurringTasks();
    process.on("SIGINT", async () => {
    });
    return service;
  }
  static async stop(runtime) {
    logger8.info("*** Stopping hypotheses service ***");
    const service = runtime.getService(_HypothesisService.serviceType);
    if (!service) {
      throw new Error("Hypotheses service not found");
    }
    service.stop();
  }
  async stop() {
    logger8.info("*** Stopping hypotheses service instance ***");
  }
};

// src/helper.ts
import { logger as logger11 } from "@elizaos/core";

// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import "dotenv/config";

// src/db/schemas/fileMetadata.ts
import { text, bigint, timestamp } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";
var biographPgSchema = pgSchema("biograph");
var fileMetadataTable = biographPgSchema.table("file_metadata", {
  id: text("id").notNull(),
  hash: text("hash").notNull().primaryKey(),
  fileName: text("file_name").notNull(),
  fileSize: bigint("file_size", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  modifiedAt: timestamp("modified_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  tags: text("tags").array()
});

// src/db/schemas/hypotheses.ts
import { uuid, text as text2, timestamp as timestamp2, numeric } from "drizzle-orm/pg-core";
import { pgSchema as pgSchema2 } from "drizzle-orm/pg-core";

// src/db/schemas/customTypes.ts
import { pgEnum } from "drizzle-orm/pg-core";
var hypothesisStatusEnum = pgEnum("hypothesis_status", [
  "pending",
  "approved",
  "rejected"
]);
var driveTypeEnum = pgEnum("drive_type", [
  "shared_folder",
  "shared_drive"
]);

// src/db/schemas/hypotheses.ts
var biographPgSchema2 = pgSchema2("biograph");
var hypothesesTable = biographPgSchema2.table("hypotheses", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  hypothesis: text2("hypothesis").notNull(),
  filesUsed: text2("files_used").array(),
  status: hypothesisStatusEnum("status").default("pending"),
  judgellmScore: numeric("judgellm_score", { precision: 5, scale: 2 }),
  humanScore: numeric("human_score", { precision: 5, scale: 2 }),
  research: text2("research"),
  evaluation: text2("evaluation"),
  citations: text2("citations").array(),
  createdAt: timestamp2("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp2("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow()
});

// src/db/schemas/driveSync.ts
import { text as text3, timestamp as timestamp3 } from "drizzle-orm/pg-core";
import { pgSchema as pgSchema3 } from "drizzle-orm/pg-core";
var biographPgSchema3 = pgSchema3("biograph");
var driveSyncTable = biographPgSchema3.table("drive_sync", {
  id: text3("id").notNull().primaryKey(),
  startPageToken: text3("start_page_token").notNull(),
  driveType: driveTypeEnum("drive_type").notNull(),
  lastSyncAt: timestamp3("last_sync_at", { withTimezone: true, mode: "date" }).notNull().defaultNow()
});

// src/db/index.ts
var { Pool } = pkg;
var pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});
var db = drizzle(pool, {
  schema: {
    hypotheses: hypothesesTable,
    fileMetadata: fileMetadataTable,
    driveSync: driveSyncTable
  }
});

// src/services/gdrive/client.ts
import { google } from "googleapis";

// src/services/gdrive/buildQuery.ts
import { logger as logger9 } from "@elizaos/core";
var SharedDriveFolderStrategy = class {
  constructor(sharedDriveFolderId) {
    this.sharedDriveFolderId = sharedDriveFolderId;
  }
  buildQuery() {
    return {
      q: `'${this.sharedDriveFolderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name, md5Checksum, size)",
      orderBy: "name"
    };
  }
  getStartPageTokenParams() {
    return {};
  }
  getDriveType() {
    return "shared_folder";
  }
  getDriveId() {
    return this.sharedDriveFolderId;
  }
};
var SharedDriveStrategy = class {
  constructor(sharedDriveId) {
    this.sharedDriveId = sharedDriveId;
  }
  buildQuery() {
    return {
      q: `'${this.sharedDriveId}' in parents and trashed=false`,
      orderBy: "name",
      fields: "files(id, name, md5Checksum, size)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      driveId: this.sharedDriveId,
      corpora: "drive"
    };
  }
  getStartPageTokenParams() {
    return {
      driveId: this.sharedDriveId,
      supportsAllDrives: true
    };
  }
  getDriveType() {
    return "shared_drive";
  }
  getDriveId() {
    return this.sharedDriveId;
  }
};
var ListFilesQueryContext = class {
  strategy;
  constructor(mainFolderId, sharedDriveId) {
    if (mainFolderId && sharedDriveId) {
      logger9.error(
        "You cannot populate both GOOGLE_DRIVE_FOLDER_ID and SHARED_DRIVE_ID."
      );
      process.exit(1);
    } else if (sharedDriveId) {
      this.strategy = new SharedDriveStrategy(sharedDriveId);
    } else if (mainFolderId) {
      this.strategy = new SharedDriveFolderStrategy(mainFolderId);
    } else {
      logger9.error(
        "Either GOOGLE_DRIVE_FOLDER_ID or SHARED_DRIVE_ID must be defined."
      );
      process.exit(1);
    }
  }
  buildQuery() {
    return this.strategy.buildQuery();
  }
  getStartPageTokenParams() {
    return this.strategy.getStartPageTokenParams();
  }
  getDriveType() {
    return this.strategy.getDriveType();
  }
  getDriveId() {
    return this.strategy.getDriveId();
  }
};

// src/services/gdrive/client.ts
import "dotenv/config";
async function initDriveClient(scopes = ["https://www.googleapis.com/auth/drive.readonly"]) {
  let credentials;
  try {
    credentials = JSON.parse(process.env.GCP_JSON_CREDENTIALS || "");
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes
    });
    return google.drive({ version: "v3", auth });
  } catch (error) {
    console.error("Error initializing Google Drive client:", error);
    throw error;
  }
}
var FOLDERS = {
  SHARED_DRIVE_FOLDER: process.env.GOOGLE_DRIVE_FOLDER_ID,
  SHARED_DRIVE_ID: process.env.SHARED_DRIVE_ID
};

// src/services/gdrive/watchFiles.ts
import { logger as logger10 } from "@elizaos/core";
import { fileURLToPath } from "url";
import { dirname } from "path";
import DKG2 from "dkg.js";
import { fromBuffer } from "pdf2pic";

// src/services/gdrive/extract/config.ts
import "dotenv/config";
import Anthropic2 from "@anthropic-ai/sdk";
import OpenAI from "openai";
import Instructor from "@instructor-ai/instructor";
import path from "path";
import fs2 from "fs";
var __dirname = path.resolve();
var Config = class _Config {
  static _instance;
  static _anthropicClient;
  static _openaiClient;
  static _instructorOai;
  static _instructorAnthropic;
  static _anthropicModel = process.env.ANTHROPIC_MODEL || "claude-3-7-sonnet-latest";
  static _openaiModel = process.env.OPENAI_MODEL || "gpt-4o";
  static _papersDirectory = path.join(__dirname, "papers");
  static _pdf2PicOptions = {
    density: 100,
    format: "png",
    width: 595,
    height: 842
  };
  constructor() {
  }
  static initialize() {
    if (!this._anthropicClient) {
      this._anthropicClient = new Anthropic2({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
    if (!this._openaiClient) {
      this._openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    if (!this._instructorOai) {
      this._instructorOai = Instructor({
        client: this._openaiClient,
        mode: "JSON"
      });
    }
    if (!fs2.existsSync(this._papersDirectory)) {
      fs2.mkdirSync(this._papersDirectory, { recursive: true });
    } else if (!fs2.lstatSync(this._papersDirectory).isDirectory()) {
      throw new Error(
        `The specified papers path "${this._papersDirectory}" is not a directory.`
      );
    }
  }
  static getInstance() {
    if (!this._instance) {
      this._instance = new _Config();
      this.initialize();
    }
    return this._instance;
  }
  static get anthropicClient() {
    this.getInstance();
    return this._anthropicClient;
  }
  static get openaiClient() {
    this.getInstance();
    return this._openaiClient;
  }
  static get anthropicModel() {
    this.getInstance();
    return this._anthropicModel;
  }
  static set anthropicModel(model) {
    this.getInstance();
    this._anthropicModel = model;
  }
  static get openaiModel() {
    this.getInstance();
    return this._openaiModel;
  }
  static set openaiModel(model) {
    this.getInstance();
    this._openaiModel = model;
  }
  static get papersDirectory() {
    this.getInstance();
    return this._papersDirectory;
  }
  static set papersDirectory(directory) {
    this.getInstance();
    this._papersDirectory = directory;
  }
  static get pdf2PicOptions() {
    this.getInstance();
    return this._pdf2PicOptions;
  }
  static set pdf2PicOptions(options) {
    this.getInstance();
    this._pdf2PicOptions = options;
  }
  static get instructorOai() {
    this.getInstance();
    return this._instructorOai;
  }
  static get instructorAnthropic() {
    this.getInstance();
    return this._instructorAnthropic;
  }
};

// src/services/gdrive/extract/index.ts
import path2 from "path";

// src/services/gdrive/extract/z.ts
import { z } from "zod";
import crypto from "crypto";
var defaultContext = {
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
  mesh: "http://id.nlm.nih.gov/mesh/"
};
var ContextSchema = z.object({
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
  mesh: z.literal("http://id.nlm.nih.gov/mesh/")
}).default(defaultContext).describe(
  "Context prefixes for JSON-LD, mapping short prefixes (e.g. go:) to full IRIs."
);
var CreatorSchema = z.object({
  "@id": z.string().describe(
    "Unique identifier for the creator, typically an ORCID URI. Defaults to a kebab-case of the creator's name."
  ).default(`https://orcid.org/${crypto.randomUUID()}`),
  "@type": z.string().describe(
    "RDF type of the creator (e.g. foaf:Person). Identifies the class of this entity in Linked Data."
  ),
  "foaf:name": z.string().describe(
    "Full display name of the creator, e.g. 'Alice Smith' or 'Alice B. Smith'."
  )
});
var PublicationVenueSchema = z.object({
  "@id": z.string().describe(
    "Primary identifier (e.g. DOI) of the publication venue (journal, conference, repository)."
  ),
  "@type": z.string().describe(
    "RDF type of the publication venue (e.g. fabio:Journal, schema:Periodical)."
  ),
  "schema:name": z.string().describe(
    "Human-readable name of the publication venue, e.g. 'Nature' or 'Proceedings of XYZ Conference'."
  )
});
var SectionSchema = z.object({
  "@id": z.string().describe(
    "Short ID or local identifier for this section, often used as a fragment or anchor."
  ),
  "@type": z.string().describe(
    "RDF type for the section, e.g. 'fabio:Section' or similar to define its role in the paper."
  ),
  "dcterms:title": z.string().describe(
    "Heading or title of this section, e.g. 'Methods', 'Results', 'Discussion'."
  ),
  "fabio:hasContent": z.string().describe(
    "Full textual content of the section (may include paragraphs of text, tables, etc.)."
  )
});
var CitationSchema = z.object({
  "@id": z.string().describe(
    "A unique identifier (often a DOI) for the cited work being referenced."
  ),
  "@type": z.string().describe(
    "RDF type of the cited resource, e.g. 'bibo:AcademicArticle' or 'schema:ScholarlyArticle'."
  ),
  "dcterms:title": z.string().describe("Title of the cited work or resource."),
  "bibo:doi": z.string().describe(
    "Explicit DOI string of the cited work, e.g. '10.1038/s41586-020-XXXXX'."
  )
});
var OntologySchema = z.object({
  "@id": z.string().describe(
    "Compact or full IRI of the ontology term discussed in the paper (e.g. GO, DOID, CHEBI, ATC, etc.) or 'http://purl.obolibrary.org/obo/xxx'."
  ),
  "schema:name": z.string().describe(
    "Human-readable label of the ontology concept discussed in the paper"
  )
});
var OntologiesSchema = z.object({
  ontologies: z.array(OntologySchema)
});
var PaperSchema = z.object({
  "@context": ContextSchema,
  "@id": z.string().describe("Top-level identifier for the paper, typically a DOI.").default(`https://doi.org/10.1234/${crypto.randomInt(1e4, 99999)}`),
  "@type": z.string().describe(
    "Type of the paper, typically 'bibo:AcademicArticle' or 'schema:ScholarlyArticle'."
  ),
  "dcterms:title": z.string().describe("Title of the paper, e.g. 'A Study on ...'."),
  "dcterms:creator": z.array(CreatorSchema).describe(
    "List of creators (authors). Each entry follows CreatorSchema, containing @id, @type, foaf:name."
  ),
  "dcterms:abstract": z.string().describe("Abstract text summarizing the paper's content and findings."),
  "schema:datePublished": z.string().describe("Publication date, usually an ISO 8601 string (YYYY-MM-DD)."),
  "schema:keywords": z.array(z.string()).describe(
    "List of keywords or key phrases describing the paper's topics."
  ),
  "fabio:hasPublicationVenue": PublicationVenueSchema.describe(
    "Metadata about where this paper was published (journal, conference, etc.)."
  ),
  "fabio:hasPart": z.array(SectionSchema).describe(
    "Sections that compose the paper. Each section has an @id, @type, title, and content."
  ),
  "cito:cites": z.array(CitationSchema).describe(
    "References/citations this paper includes. Each entry has an identifier, type, title, and DOI."
  )
}).describe(
  "Complete JSON-LD schema for a scientific paper, including authors, venue, sections, citations, and ontology references."
);

// src/services/gdrive/extract/index.ts
var __dirname2 = path2.resolve();

// src/services/gdrive/storeJsonLdToKg.ts
import { Store } from "n3";
import { JsonLdParser } from "jsonld-streaming-parser";
import axios4 from "axios";

// src/services/gdrive/watchFiles.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname3 = dirname(__filename);

// src/helper.ts
import "dotenv/config";
async function initDriveSync(runtime) {
  const driveSync = await runtime.db.select().from(driveSyncTable);
  if (driveSync.length === 0) {
    logger11.info("Initializing drive sync");
    logger11.info("No drive sync found, creating new one");
    const driveClient = await initDriveClient();
    const listFilesQueryContext = new ListFilesQueryContext(
      process.env.GOOGLE_DRIVE_FOLDER_ID,
      process.env.SHARED_DRIVE_ID
    );
    const startPageTokenParams = listFilesQueryContext.getStartPageTokenParams();
    const startPageTokenResponse = await driveClient.changes.getStartPageToken(startPageTokenParams);
    const startPageToken = startPageTokenResponse.data.startPageToken;
    const driveType = listFilesQueryContext.getDriveType();
    const driveId = listFilesQueryContext.getDriveId();
    await runtime.db.insert(driveSyncTable).values({
      id: driveId,
      startPageToken,
      driveType
    });
  } else {
    logger11.info("Drive sync already initialized");
  }
}

// src/routes/gdrive/webhook.ts
import { logger as logger13 } from "@elizaos/core";

// src/routes/controller.ts
import { eq } from "drizzle-orm";
import { logger as logger12 } from "@elizaos/core";
async function syncGoogleDriveChanges(runtime) {
  const driveSync = await runtime.db.select().from(driveSyncTable);
  if (driveSync.length === 0) {
    logger12.error("No drive sync found, cannot process changes");
    throw new Error("Drive sync not initialized");
  }
  const syncRecord = driveSync[0];
  const { id: driveId, startPageToken, driveType } = syncRecord;
  const drive = await initDriveClient([
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/drive"
  ]);
  const params = {
    pageToken: startPageToken,
    includeRemoved: true,
    fields: "newStartPageToken, changes(fileId, removed, file(id, name, md5Checksum, size, trashed, mimeType))"
  };
  if (driveType === "shared_drive") {
    params.driveId = driveId;
    params.supportsAllDrives = true;
    params.includeItemsFromAllDrives = true;
  } else if (driveType === "shared_folder") {
    params.spaces = "drive";
    params.restrictToMyDrive = false;
    params.q = `'${driveId}' in parents`;
  }
  const changesResponse = await drive.changes.list(params);
  logger12.info(`Found ${changesResponse.data.changes?.length || 0} changes`);
  let processedCount = 0;
  if (changesResponse.data.changes && changesResponse.data.changes.length > 0) {
    for (const change of changesResponse.data.changes) {
      if (!change.fileId) continue;
      processedCount++;
      if (change.removed) {
        logger12.info(
          `File ${change.fileId} removed from trash - no action needed`
        );
      } else if (change.file?.trashed) {
        logger12.info(
          `File ${change.fileId} moved to trash - removing from database`
        );
        await runtime.db.delete(fileMetadataTable).where(eq(fileMetadataTable.id, change.fileId));
      } else if (change.file && !change.file.trashed) {
        const file = change.file;
        if (file.mimeType === "application/pdf") {
          logger12.info(`Processing PDF file: ${file.name}`);
          await runtime.db.insert(fileMetadataTable).values({
            id: file.id,
            hash: file.md5Checksum,
            fileName: file.name,
            fileSize: Number(file.size),
            modifiedAt: /* @__PURE__ */ new Date()
          }).onConflictDoUpdate({
            target: fileMetadataTable.hash,
            set: {
              fileName: file.name,
              fileSize: Number(file.size),
              modifiedAt: /* @__PURE__ */ new Date(),
              id: file.id
            }
          });
          logger12.info(
            `Saved/updated file metadata for ${file.name} (${file.id})`
          );
        } else {
          logger12.info(`Skipping non-PDF file: ${file.name} (${file.mimeType})`);
        }
      }
    }
  }
  if (changesResponse.data.newStartPageToken) {
    await runtime.db.update(driveSyncTable).set({
      startPageToken: changesResponse.data.newStartPageToken,
      lastSyncAt: /* @__PURE__ */ new Date()
    }).where(eq(driveSyncTable.id, driveId));
    logger12.info(
      `Updated start page token to: ${changesResponse.data.newStartPageToken}`
    );
  }
  return {
    changes: changesResponse.data.changes?.length || 0,
    processed: processedCount
  };
}

// src/routes/gdrive/webhook.ts
var gdriveWebhook = {
  path: "/gdrive/webhook",
  type: "POST",
  handler: async (_req, res, runtime) => {
    try {
      logger13.info("Google Drive webhook triggered");
      const result = await syncGoogleDriveChanges(runtime);
      res.json({
        message: "OK",
        ...result
      });
    } catch (error) {
      logger13.error("Error processing Google Drive webhook:", error);
      res.status(500).json({
        message: "Error processing webhook",
        error: error.message
      });
    }
  }
};

// src/routes/gdrive/manualSync.ts
import { logger as logger14 } from "@elizaos/core";
var gdriveManualSync = {
  path: "/gdrive/sync",
  type: "GET",
  handler: async (_req, res, runtime) => {
    try {
      logger14.info("Manual Google Drive sync triggered");
      const result = await syncGoogleDriveChanges(runtime);
      while (result.changes > 0) {
        await syncGoogleDriveChanges(runtime);
      }
      res.json({
        message: "Sync completed successfully",
        ...result
      });
    } catch (error) {
      logger14.error("Error during manual Google Drive sync:", error);
      res.status(500).json({
        message: "Error during sync",
        error: error.message
      });
    }
  }
};

// src/routes/health.ts
var health = {
  path: "/health",
  type: "GET",
  handler: async (_req, res) => {
    res.json({
      message: "OK"
    });
  }
};

// src/actions/index.ts
var actions_exports = {};
__export(actions_exports, {
  dkgInsert: () => dkgInsert
});

// src/index.ts
var dkgPlugin = {
  init: async (config, runtime) => {
    logger15.info("Initializing dkg plugin");
    logger15.info(config);
    setTimeout(async () => {
      await initDriveSync(runtime);
    }, 2e4);
  },
  name: "dkg",
  description: "Agent DKG which allows you to store memories on the OriginTrail Decentralized Knowledge Graph",
  actions: [dkgInsert],
  providers: [],
  evaluators: [],
  services: [HypothesisService],
  routes: [health, gdriveWebhook, gdriveManualSync]
};
export {
  actions_exports as actions,
  dkgPlugin
};
//# sourceMappingURL=index.js.map