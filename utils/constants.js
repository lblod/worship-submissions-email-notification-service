export const PREFIX_TABLE = {
    meb:          'http://rdf.myexperiment.org/ontologies/base/',
    xsd:          'http://www.w3.org/2001/XMLSchema#',
    pav:          'http://purl.org/pav/',
    dct:          'http://purl.org/dc/terms/',
    besluit:      'http://data.vlaanderen.be/ns/besluit#',
    muAccount:    'http://mu.semte.ch/vocabularies/account/',
    org:          'http://www.w3.org/ns/org#',
    prov:         'http://www.w3.org/ns/prov#',
    mu:           'http://mu.semte.ch/vocabularies/core/',
    ext:          'http://mu.semte.ch/vocabularies/ext/',
    skos:         'http://www.w3.org/2004/02/skos/core#',
    rdf:          'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    nmo:          'http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#',
  };
  
  export const PREFIXES = (() => {
    const all = [];
    for (const key in PREFIX_TABLE)
      all.push(`PREFIX ${key}: <${PREFIX_TABLE[key]}>`);
    return all.join('\n');
  })();