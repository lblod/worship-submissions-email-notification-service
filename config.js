export const ORG_GRAPH_BASE = process.env.ORG_GRAPH_BASE || 'http://mu.semte.ch/graphs/organizations/';
export const ORG_GRAPH_SUFFIX = process.env.ORG_GRAPH_SUFFIX || '/LoketLB-databankEredienstenGebruiker';
export const DISPATCH_SOURCE_GRAPH = process.env.DISPATCH_SOURCE_GRAPH || 'http://mu.semte.ch/graphs/temp/for-dispatch';

export const MAX_AGE = process.env.MAX_MESSAGE_AGE || 3; // days
export const SYSTEM_EMAIL_GRAPH = 'http://mu.semte.ch/graphs/system/email';
export const OUTBOX_FOLDER_URI = process.env.OUTBOX_FOLDER_URI || 'http://data.lblod.info/id/mail-folders/2';