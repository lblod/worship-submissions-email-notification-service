import { generateHtmlEmail, newEmail } from "../lib/tasks";
import { uuid } from "mu";

/**
 * Creates a mock email for multiple submissions
 * @returns email Object
 */
export function multipleSubmissionsMockEmail() {
  const now = new Date().toISOString();
  const links = [
    `${process.env.WORSHIP_DECISIONS_APP_BASEURL}search/submissions/${uuid()}`,
    `${process.env.WORSHIP_DECISIONS_APP_BASEURL}search/submissions/${uuid()}`,
    `${process.env.WORSHIP_DECISIONS_APP_BASEURL}search/submissions/${uuid()}`,
  ];
  let email = newEmail(
    "me@redpencil.io",
    "you@redpencil.io",
    `${links.length} Nieuwe inzendingen - ${now}`,
    `content ${now}`
  );
  email.uri = `http://data.lblod.info/id/emails/${email.uuid}`;
  email.bcc = "blindcc@redpencil.io";
  email.htmlContent = generateHtmlEmail("foo", links);
  return email;
}

/**
 * Creates a mock email for single submission
 * @returns email Object
 */
export function singleSubmissionMockEmail() {
  const now = new Date().toISOString();
  const link = [`${
    process.env.WORSHIP_DECISIONS_APP_BASEURL
  }search/submissions/${uuid()}`];
  let email = newEmail(
    "me@redpencil.io",
    "you@redpencil.io",
    `DossierType - Nieuwe inzendingen - ${now}`,
    `content ${now}`
  );
  email.uri = `http://data.lblod.info/id/emails/${email.uuid}`;
  email.bcc = "blindcc@redpencil.io";
  email.htmlContent = generateHtmlEmail("foo", link);
  return email;
}
