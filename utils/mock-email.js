import { generateHtmlEmail, newEmail } from "../lib/tasks";

/**
 * Creates a mock email for multiple submissions
 * @returns email Object
 */
export function multipleSubmissionsMockEmail() {
  const now = new Date().toISOString();
  const submissions = [
    { submissionUri: "http://data.lblod.info/submissions/1041fe53-7d98-46fb-8db9-98a66060498a", decisionTypeLabel: "Afschrift erkenningszoekende besturen" , creatorEenheidLabel: "Kerkfabriek O.-L.-Vrouw van Aalst", sentDate: "2024-03-12T16:00:57.957Z", url: `${process.env.WORSHIP_DECISIONS_APP_BASEURL}search/submissions/1041fe53-7d98-46fb-8db9-98a66060498a`},
    { submissionUri: "http://data.lblod.info/submissions/1041fe53-7d98-46fb-8db9-98a66060498b", decisionTypeLabel: "Jaarrekening" , creatorEenheidLabel: "Kerkfabriek St.-Martinus van Aalst", sentDate: "2023-04-01T11:00:23.803Z", url: `${process.env.WORSHIP_DECISIONS_APP_BASEURL}search/submissions/1041fe53-7d98-46fb-8db9-98a66060498b`},
    { submissionUri: "http://data.lblod.info/submissions/1041fe53-7d98-46fb-8db9-98a66060498c", decisionTypeLabel: "Opstart beroepsprocedure naar aanleiding van een beslissing" , creatorEenheidLabel: "Kerkfabriek H. Hart van Aalst", sentDate: "2024-01-10T09:00:00.398Z", url: `${process.env.WORSHIP_DECISIONS_APP_BASEURL}search/submissions/1041fe53-7d98-46fb-8db9-98a66060498c`}
  ];
  let email = newEmail(
    "me@redpencil.io",
    "you@redpencil.io",
    `${submissions.length} Nieuwe inzendingen - ${now}`,
    `content ${now}`
  );
  email.uri = `http://data.lblod.info/id/emails/${email.uuid}`;
  email.bcc = "blindcc@redpencil.io";
  email.htmlContent = generateHtmlEmail("Aalst", submissions);
  return email;
}

/**
 * Creates a mock email for single submission
 * @returns email Object
 */
export function singleSubmissionMockEmail() {
  const now = new Date().toISOString();
  const submissions = [{ submissionUri: "http://data.lblod.info/submissions/40500896-8e52-4660-883e-534ec511384b", decisionTypeLabel: "Opstart beroepsprocedure naar aanleiding van een beslissing" , creatorEenheidLabel: "Kerkfabriek H. Hart van Aalst", sentDate: "2024-01-10T09:00:00.398Z", url: `${process.env.WORSHIP_DECISIONS_APP_BASEURL}search/submissions/40500896-8e52-4660-883e-534ec511384b`}];
  let email = newEmail(
    "me@redpencil.io",
    "you@redpencil.io",
    `DossierType ${submissions[0].decisionTypeLabel} - Nieuwe inzending - ${now}`,
    `content ${now}`
  );
  email.uri = `http://data.lblod.info/id/emails/${email.uuid}`;
  email.bcc = "blindcc@redpencil.io";
  email.htmlContent = generateHtmlEmail("Aalst", submissions);
  return email;
}
