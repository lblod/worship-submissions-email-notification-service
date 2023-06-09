export const ORG_GRAPH_BASE = process.env.ORG_GRAPH_BASE || 'http://mu.semte.ch/graphs/organizations/';
export const ORG_GRAPH_SUFFIX = process.env.ORG_GRAPH_SUFFIX || '/ABB_databankErediensten_LB_CompEnts_gebruiker';
export const DISPATCH_SOURCE_GRAPH = process.env.DISPATCH_SOURCE_GRAPH || 'http://mu.semte.ch/graphs/temp/for-dispatch';

export const ABB_URI = 'http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b';
export const MESSAGE_GRAPH_PATTERN_START = 'http://mu.semte.ch/graphs/organizations/';
export const MESSAGE_GRAPH_PATTERN_END = '/LoketLB-databankEredienstenGebruiker';
export const MAX_AGE = process.env.MAX_MESSAGE_AGE || 3; // days
export const SYSTEM_EMAIL_GRAPH = 'http://mu.semte.ch/graphs/system/email';
export const OUTBOX_FOLDER_URI = process.env.OUTBOX_FOLDER_URI || 'http://data.lblod.info/id/mail-folders/2';