export function getPaperByDoi(doi: string) {
    if (doi.startsWith("https://doi.org/")) {
        doi = doi.replace("https://doi.org/", "");
    }
    const getPaperByDoiQuery = `PREFIX fabio: <http://purl.org/spar/fabio/>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX foaf:   <http://xmlns.com/foaf/0.1/>
    PREFIX obi:    <http://purl.obolibrary.org/obo/>
    PREFIX schema: <http://schema.org/>

    SELECT ?paper ?title ?abstract ?doi
        (GROUP_CONCAT(DISTINCT ?creatorName;    SEPARATOR=", ") AS ?allCreators)
        (GROUP_CONCAT(DISTINCT ?multiomics;     SEPARATOR=" | ") AS ?allMultiomics)
        (GROUP_CONCAT(DISTINCT ?assays;         SEPARATOR=" | ") AS ?allAssays)
        (GROUP_CONCAT(DISTINCT ?cohort;         SEPARATOR=" | ") AS ?allCohortInfo)
        (GROUP_CONCAT(DISTINCT ?analysisDesc;   SEPARATOR=" | ") AS ?allAnalysisDesc)
        (GROUP_CONCAT(DISTINCT ?relatedOrg;     SEPARATOR=" | ") AS ?allRelatedOrgs)
    WHERE {
    
    <https://doi.org/${doi}> a fabio:ResearchPaper ;
                                                dcterms:title ?title ;
                                                dcterms:abstract ?abstract ;
                                                dcterms:identifier ?doi .
    BIND (<https://doi.org/${doi}> AS ?paper)
    
    OPTIONAL {
        ?paper dcterms:creator ?creator .
        ?creator foaf:name ?creatorName .
    }
    
    OPTIONAL {
        ?paper obi:OBI_0000299 ?multiomicsNode .
        ?multiomicsNode dcterms:description ?multiomics .
    }
    
    OPTIONAL {
        ?paper obi:OBI_0000968 ?assayNode .
        ?assayNode dcterms:description ?assays .
    }
    
    OPTIONAL {
        ?paper obi:OBI_0000293 ?cohortNode .
        ?cohortNode dcterms:description ?cohort .
    }
    
    OPTIONAL {
        ?paper obi:OBI_0200000 ?analysisNode .
        ?analysisNode dcterms:description ?analysisDesc .
    }
    
    OPTIONAL {
        ?paper schema:relatedTo ?related .
        ?related schema:name ?relatedOrg .
    }
    }
    GROUP BY ?paper ?title ?abstract ?doi`;

    return getPaperByDoiQuery;
}

export function paperExists(doi: string) {
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
