export const basic_info_example_input = `
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

export const basic_info_example_output = `
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

export const citations_example_input = `
Doe John, Jane Doe, Paper title example 1, https://doi.org/random-doi-identifier1
Doe Peter, Maria Doe, Paper title example 2, https://doi.org/random-doi-identifier2
Smith Smith, Bob Smith, Paper title example 3, https://doi.org/random-doi-identifier3
`;

export const citations_example_output = `
"citations": "Doe John, Paper title example 1 - https://doi.org/random-doi-identifier1
Doe Peter, Paper title example 2 - https://doi.org/random-doi-identifier2
Smith Smith, Paper title example 3 - https://doi.org/random-doi-identifier3"
`;

export const subgraph_go_example_input = `
[
{
    "text": "Description of a biological process involving X and Y."
}
]
`;

export const subgraph_go_example_output = `
[
{
    "subject": "example biological term 1", // Make sure to use the name of the subject, not the Gene Ontology ID (GO_...)
    "predicate": "example Gene Ontology relationship",
    "object": "example biological term 1", // Make sure to use the name of the object, not the Gene Ontology ID (GO_...)
    "explanation": "example explanation ..."
}
]
`;

export const subgraph_doid_example_input = `
[
{
    "text": "Description of Disease X with symptoms Y and Z."
}
]
`;

export const subgraph_doid_example_output = `
[
{
    "disease": "Disease X",
    "findings": "Disease X is characterized by symptoms Y and Z."
}
]
`;

export const subgraph_chebi_example_input = `
[
{
    "text": "Description of Chemical Compound X."
}
]
`;

export const subgraph_chebi_example_output = `
[
{
    "compound": "Chemical Compound X",
    "findings": "Chemical Compound X is known for its properties Y and Z."
}
]
`;

export const subgraph_atc_example_input = `
[
{
    "text": "Description of Drug X classified under ATC code Y."
}
]
`;

export const subgraph_atc_example_output = `
[
{
    "drug": "Drug X",
    "findings": "Drug X, classified under ATC code Y, is used for treating Z."
}
]
`;

export const gene_ontology_example_input = `
[
    {
        "subject": {"term": "GO term example subject name", "id": "GO_XXXXXX"},
        "predicate": "some of the gene ontology relationships",
        "object": {"term": "GO term example object name", "id": "GO_XXXXXX"},
        "explanation": "example explanation ..."
    }
]
`;

export const doid_ontology_example_input = `
[
    {
        "disease": "DOID_XXX",
        "title": "Disease Y",
        "findings": "Disease Y is a condition characterized by specific symptoms and causes. Patients with Disease Y often exhibit symptoms such as A, B, and C. Recent research indicates that genetic mutations in Gene1 and Gene2 may contribute to the pathogenesis of Disease Y."
    }
]
`;

export const chebi_ontology_example_input = `
[
    {
        "compound_id": "CHEBI_XXXX",
        "compound": "Chemical X",
        "findings": "Chemical X (Formula) is a compound that at room temperature is characterized by certain properties. It is widely studied and is known for its ability to perform Function Y."
    }
]
`;

export const example_basic_info = `
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

export const example_spar_output = `
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

export const example_go_output = `
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

export const example_doid_output = `
[
        {
            "@id": "http://purl.obolibrary.org/obo/CHEBI_XXXXXX",
            "dcterms:title": "Chemical X",                
            "dcterms:description": "Chemical X (Formula) is a compound with certain properties. It is widely studied and known for Function Y."
        }
        /* Other DOID entries would be similarly structured */
]
`;

export const example_chebi_output = `
[
        {
            "@id": "http://purl.obolibrary.org/obo/DOID_XXXXX",
            "dcterms:title": "Compound Y",                
            "dcterms:description": "Compound Y (Formula) is a chemical with properties A and B. It is essential in biological processes and known for characteristic C."
        },
        {
            "@id": "http://purl.obolibrary.org/obo/DOID_YYYYY",
            "dcterms:title": "Disease X",
            "dcterms:description": "Disease X is a disorder characterized by symptoms A, B, and C. It is linked to genetic factors such as mutations in Gene1, Gene2, and Gene3."
        }
        /* Other DOID entries would be similarly structured */
]
`;

export const example_json_citations = [
  {
    "@id": "https://doi.org/10.1234/another-article",
    "dcterms:title": "Related Work on Y",
  },
  {
    "@id": "https://doi.org/10.5678/related-work",
    "dcterms:title": "Further Discussion on Z",
  },
];

export const example_graph = `
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
    "dcterms:abstract": "Hearing loss is a major disability in everyday life and therapeutic interventions to protect hearing would bene\ufb01t a large portion of the world population. Here we found that mice devoid of the protein kinase suppressor of RAS 1 (KSR1) in their tissues (germline KO mice) exhibit resistance to both cisplatin- and noise-induced permanent hearing loss compared with their wild-type KSR1 litter- mates. KSR1 is a scaffold protein that brings in proximity the mitogen-activated protein kinase (MAPK) proteins BRAF, MEK1/2 and ERK1/2 and assists in their activation through a phosphorylation cascade induced by both cisplatin and noise insults in the cochlear cells. KSR1, BRAF, MEK1/2, and ERK1/2 are all ubiquitously expressed in the cochlea. Deleting the KSR1 protein tempered down the MAPK phosphorylation cascade in the cochlear cells following both cisplatin and noise insults and conferred hearing protection of up to 30 dB SPL in three tested frequencies in male and female mice. Treatment with dabrafenib, an FDA-approved oral BRAF inhibitor, protected male and female KSR1 wild-type mice from both cisplatin- and noise-induced hearing loss. Dabrafenib treatment did not enhance the protection of KO KSR1 mice, providing evidence dabrafenib works primarily through the MAPK pathway. Thus, either elimination of the KSR1 gene expression or drug inhibition of the MAPK cellular pathway in mice resulted in profound protection from both cisplatin- and noise-induced hearing loss. Inhibition of the MAPK pathway, a cel- lular pathway that responds to damage in the cochlear cells, can prove a valuable strategy to protect and treat hearing loss.",
    "dcterms:date": "2024-03-21",
    "dcterms:publisher": "Neurobiology of Disease",
    "dcterms:identifier": "https://doi.org/10.1523/JNEUROSCI.2174-23.2024",
    "dcterms:rights": "T.T. and J.Z. are inventors on a patent for the use of dabrafenib in hearing protection (US 2020-0093923 A1 and US Patent no 11,433,073, 18794717.1 / EP 3618807, Japan 2022-176126, China 201880029618.7) and are cofounders of Ting Therapeutics. All other authors declare that they have no competing \ufb01nancial interests.",
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

export const incorrect_json_example = `
[
  {
    "@id": "https://doi.org/XXXXX",
    "dcterms:title": "Title of Paper X"
  },
  {
    "@id": "https://doi.org/YYYYY",
    "dcterms:title": "Title of Paper Y"
  },
  {
    "@id": "https://doi.org/ZZZZZ",
    "dcterms:title": "Title of Paper Z"
  },
  {
    "@id": "https://doi.org/AAAAA",
    "dcterms:title": "Title of Paper A"
  },
  {
    "@id": "https://doi.org/BBBBB",
    "dcterms:title": "Title of Paper B"
  },
  {
    "@id": "https://doi.org/CCCCC",
    "dcterms:title": "Title of Paper C"
  },
  {
    "@id": "https://doi.org/DDDDD",
    "dcterms:title": "Title of Paper D"
  },
  {
    "@id": "https://doi.org/EEEEE",
    "dcterms:title": "Title of Paper E"
  },
  {
    "@id": "https://doi.org/FFFFF",
    "dcterms:title": "Title of Paper F"
  },
  {
    "@id": "https://doi.org/
`;

export const correct_json_example = `
[
  {
    "@id": "https://doi.org/XXXXX",
    "dcterms:title": "Title of Paper X"
  },
  {
    "@id": "https://doi.org/YYYYY",
    "dcterms:title": "Title of Paper Y"
  },
  {
    "@id": "https://doi.org/ZZZZZ",
    "dcterms:title": "Title of Paper Z"
  },
  {
    "@id": "https://doi.org/AAAAA",
    "dcterms:title": "Title of Paper A"
  },
  {
    "@id": "https://doi.org/BBBBB",
    "dcterms:title": "Title of Paper B"
  },
  {
    "@id": "https://doi.org/CCCCC",
    "dcterms:title": "Title of Paper C"
  },
  {
    "@id": "https://doi.org/DDDDD",
    "dcterms:title": "Title of Paper D"
  },
  {
    "@id": "https://doi.org/EEEEE",
    "dcterms:title": "Title of Paper E"
  },
  {
    "@id": "https://doi.org/FFFFF",
    "dcterms:title": "Title of Paper F"
  }
]
`;
