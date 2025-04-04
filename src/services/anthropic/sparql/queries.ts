export const getKeywordsQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?obj WHERE {
  ?sub <https://schema.org/keywords> ?obj .
}
GROUP BY ?obj`;

export const getAbstractsQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?sub ?abstract WHERE {
  ?sub <https://schema.org/keywords> {{keyword}} .
  ?sub <http://purl.org/dc/terms/abstract> ?abstract
}`;

// instead of using keywords, we will get findings from the GO/CHEBI/ATC ontologies and assay/output fields
export const getFindingsQuery = `PREFIX fabio: <http://purl.org/spar/fabio/>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX obi: <http://purl.obolibrary.org/obo/>

SELECT DISTINCT ?description ?paper
WHERE {
  VALUES ?predicate {
    obi:OBI_0000299
    obi:OBI_0000070
    obi:OBI_0200000
  }
  
  ?paper a fabio:ResearchPaper;
  ?predicate ?obj .
  
  {
    ?obj dcterms:description ?description .
  }
  UNION
  {
    ?obj ?p ?innerObj .
    ?innerObj dcterms:description ?description .
  }
}`;

// query searches for abstract first, and defaults to LLM generated summary if abstract was not extracted
export const getAbstractsForPapersQuery = (papers: string[]): string => {
  const valuesBlock = papers.map((paper) => `<${paper}>`).join(" ");

  return `
    PREFIX fabio: <http://purl.org/spar/fabio/>
    PREFIX dcterms: <http://purl.org/dc/terms/>

    SELECT DISTINCT ?paper ?abstract
    WHERE {
      VALUES ?paper { ${valuesBlock} }
      ?paper a fabio:ResearchPaper .

      OPTIONAL { ?paper dcterms:abstract ?abs . }
      OPTIONAL { ?paper dcterms:hasPart ?part . }

      BIND(COALESCE(?abs, ?part) AS ?abstract)
    }
  `;
};

export const getPreviousHypothesesForKeywordsQuery = (
  keywords: string[]
): string => {
  const valuesBlock = keywords.map((keyword) => `"${keyword}"`).join(" ");

  return `
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX deo: <http://purl.org/spar/deo/>

    SELECT DISTINCT ?hypothesisEntity ?hypothesis
    WHERE {
      ?hypothesisEntity a deo:FutureWork ;
                        dcterms:subject ?subject ;
                        dcterms:references ?hypothesis .

      VALUES ?subject { ${valuesBlock} }
    }
  `;
};
