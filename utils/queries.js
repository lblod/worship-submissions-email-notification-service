import { sparqlEscapeUri, sparqlEscapeString, sparqlEscapeDateTime, uuid } from "mu";
import { querySudo as query, updateSudo as update } from "@lblod/mu-auth-sudo";
import {
  ORG_GRAPH_BASE,
  ORG_GRAPH_SUFFIX,
  SYSTEM_EMAIL_GRAPH,
  OUTBOX_FOLDER_URI,
  ERROR_GRAPH
} from "../config";
import { parseResult } from "./utils";
import { PREFIXES } from "./constants";

/**
 * Fetching all relevant information about the submission so it can be extracted for later use.
 * Note : Submissions can be linked to multiple email through the dct:relation
 */
export async function getSubmissionInfo(bestuurseenheid, afterDateSent = null) {
  try {
    const afterDateSentFilter = `FILTER(?sentDate > ${sparqlEscapeDateTime(afterDateSent)})`;

    const queryInfo = `
    ${PREFIXES}
    SELECT DISTINCT
      ?targetEenheid
      ?targetEenheidUuid
      ?targetEenheidLabel
      ?creatorEenheid
      ?creatorEenheidLabel
      ?decisionTypeLabel
      ?sentDate
      ?emailAddress
      ?submissionUri
      ?submissionId
    WHERE {
        VALUES ?targetEenheid {
         ${sparqlEscapeUri(bestuurseenheid)}
        }
        ?targetEenheid a besluit:Bestuurseenheid ;
          mu:uuid ?targetEenheidUuid ;
          ext:wilMailOntvangen "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> ;
          ext:mailAdresVoorNotificaties ?emailAddress ;
          skos:prefLabel ?targetEenheidLabel .
      BIND(IRI(CONCAT(${sparqlEscapeString(
        ORG_GRAPH_BASE
      )}, ?targetEenheidUuid, ${sparqlEscapeString(
      ORG_GRAPH_SUFFIX
    )})) as ?graph)
      GRAPH ?graph {
        ?submissionUri a meb:Submission ;
          <http://mu.semte.ch/vocabularies/core/uuid> ?submissionId;
          pav:createdBy ?creatorEenheid ;
          nmo:sentDate ?sentDate ;
          prov:generated ?formData .
      }

      ${afterDateSent ? afterDateSentFilter : ''}

      FILTER (?targetEenheid != ?creatorEenheid)
      FILTER NOT EXISTS {
        GRAPH ${sparqlEscapeUri(SYSTEM_EMAIL_GRAPH)} {
          ?email dct:relation ?submissionUri ;
            dct:relation ?targetEenheid ;
            a nmo:Email .
        }
      }
      ?creatorEenheid a besluit:Bestuurseenheid ;
        skos:prefLabel ?creatorEenheidLabel .
      ?formData dct:type ?decisionType .
      ?decisionType skos:prefLabel ?decisionTypeLabel .
    }
  `;
    return parseResult(await query(queryInfo));
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}

/**
 * Puts email in the right mail folder graph for sending
 * @param {Array} submissions
 * @param {Object} email
 * @param {String} targetEenheid
 */
export async function insertEmail(submissions, email, targetEenheid) {
  try {
    const submissionRelations = `dct:relation ${submissions
      .map(({submissionUri}) => sparqlEscapeUri(submissionUri))
      .join(", ")}`;

    const emailQuery = `
  ${PREFIXES}
  INSERT DATA {
    GRAPH ${sparqlEscapeUri(SYSTEM_EMAIL_GRAPH)} {

  ${sparqlEscapeUri(email.uri)}
      rdf:type nmo:Email ;
      mu:uuid ${sparqlEscapeString(email.uri.split("/").pop())} ;
      nmo:isPartOf ${sparqlEscapeUri(OUTBOX_FOLDER_URI)} ;
      nmo:htmlMessageContent ${sparqlEscapeString(email.htmlContent)} ;
      nmo:plainTextMessageContent ${sparqlEscapeString(email.plainTextMessageContent)} ;
      nmo:messageSubject ${sparqlEscapeString(email.subject)} ;
      nmo:emailTo ${sparqlEscapeString(email.to)} ;
      nmo:messageFrom ${sparqlEscapeString(process.env.FROM_EMAIL_ADDRESS)} ;
      ${email.bcc ? `nmo:bcc ${sparqlEscapeString(email.bcc)} ;` : ""}
      dct:relation ${sparqlEscapeUri(targetEenheid)} ;
      ${submissionRelations} .
    }
  }`;
    await update(emailQuery);
  } catch (err) {
    console.log("error", err);
    throw new Error(err);
  }
}

export async function getRelevantBestuurseenheden() {
  const queryString = `
    SELECT DISTINCT ?eenheid WHERE {
        VALUES ?classificatie {
          <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/36372fad-0358-499c-a4e3-f412d2eae213>
          <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/52cc9d8d-1c9a-4d92-9936-da9d4a622ec4>
          <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000>
          <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>
          <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000003>
          <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/66ec74fd-8cfc-4e16-99c6-350b35012e86>
          <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/f9cac08a-13c1-49da-9bcb-f650b0604054>
          <http://data.vlaanderen.be/id/concept/RepresentatiefOrgaanClassificatieCode/89a00b5a-024f-4630-a722-65a5e68967e5>
        }
        GRAPH <http://mu.semte.ch/graphs/public> {
          ?eenheid a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>;
          <http://data.vlaanderen.be/ns/besluit#classificatie> | <http://www.w3.org/ns/org#classification> ?classificatie.
       }
    }
  `;
  return parseResult(await query(queryString)).map(r => r.eenheid);

}

export async function createError(message){
  const id = uuid();
  const uri = `http://data.lblod.info/error/id/` + id;
  const created = new Date();

  const queryError = `
   PREFIX dct: <http://purl.org/dc/terms/>
   PREFIX oslc: <http://open-services.net/ns/core#>
   PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
   INSERT DATA {
    GRAPH ${sparqlEscapeUri(ERROR_GRAPH)}{
      ${sparqlEscapeUri(uri)} a <http://open-services.net/ns/core#Error>;
        mu:uuid ${id};
        dct:subject ${sparqlEscapeString("Error creating email worship notification.")};
        dct:created ${sparqlEscapeDateTime(created)};
        oslc:message ${sparqlEscapeString(message)};
        dct:creator <http://data.lblod.info/services/worship-submissions-email-notification-service>.
    }
   }
  `;

  await update(queryError);
}
