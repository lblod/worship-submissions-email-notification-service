import { uuid } from "mu";
import { getSubmissionInfo, insertEmail, getRelevantBestuurseenheden, createError } from "../utils/queries";
import { formatDate } from '../utils/utils';
import { MAX_AGE } from '../config';

/**
 * @param {String} emailFrom
 * @param {String} to
 * @param {String} subject
 * @param {String} content
 * @returns
 */
export function newEmail(emailFrom, to, subject, content) {
  const email = {};
  email.uuid = uuid();
  email.from = emailFrom;
  email.to = to;
  email.subject = subject;
  email.content = content;
  return email;
}

/**
 * Builds a plain text template for the mail to be sent.
 * @param {String} targetEenheidLabel
 * @param {Array} submissions
 * @returns plain text email template
 */
export function generatePlainTextEmail(targetEenheidLabel, submissions) {

  return `
Beste,

Uw bestuur "${targetEenheidLabel}" heeft nieuwe inzendingen ontvangen via het Loket voor Lokale Besturen [https://loket.lokaalbestuur.vlaanderen.be/login], module Databank Erediensten.

Details voor inzendingen:
${submissions.map(({ decisionTypeLabel, creatorEenheidLabel, sentDate, url }) => (
  `\n * Nieuwe inzending: ${decisionTypeLabel} aangemaakt door ${creatorEenheidLabel} op ${formatDate(sentDate)}\n Bekijk [${url}]`
)).join('\n\n')}

De Vlaamse overheid zet verder in op digitalisering. Alle communicatie in het kader van het eredienstendecreet en het erkenningsdecreet gebeurt voortaan digitaal via het Loket voor Lokale besturen. Meer info hierover vindt u op onze webpagina: [https://www.vlaanderen.be/lokaal-bestuur/digitale-communicatie-met-de-vlaamse-overheid].

Met vriendelijke groet,
Agentschap Binnenlands Bestuur

Opgelet, reageren op deze mail kan niet. Voor vragen over het Loket voor Lokale Besturen, mail naar loketlokaalbestuur@vlaanderen.be [loketlokaalbestuur@vlaanderen.be]. Voor inhoudelijke vragen kunt u mailen naar het algemeen mailadres binnenland@vlaanderen.be [binnenland@vlaanderen.be].
  `;
}


/**
 * Builds an HTML template for the mail to be sent.
 * @param {String} targetEenheidLabel
 * @param {Array} submissions
 * @returns html email template
 */
export function generateHtmlEmail(targetEenheidLabel, submissions) {

  const htmlSubmissionsRows = submissions.slice().sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate)).map(({decisionTypeLabel, creatorEenheidLabel, sentDate, url}) => (
      `<tr style="border-left: .1rem solid #cfd5dd; border-bottom: .1rem solid #cfd5dd; background-color: #f7f9fc;">
        <td style="padding: 1.2rem;"><strong>Nieuwe inzending</strong> : <em style="color: #545961;">${decisionTypeLabel}</em> aangemaakt door <strong>${creatorEenheidLabel}</strong> op <time datetime="${sentDate}">${formatDate(sentDate)}</time></td>
        <td style="padding: 1.2rem; border-left: .1rem dotted #cfd5dd;"><a href="${url}" target="_blank">Bekijk</a></td>
      </tr>`
    )).join('');

  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0 " />
    <meta name="format-detection" content="telephone=no" />
    <!--[if !mso]><! -->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />
    <!--<![endif]-->
  </head>

  <body>
    <p style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;">Beste</p><br /><br />
    <p style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;">Uw bestuur &quot;${targetEenheidLabel}&quot; heeft nieuwe inzendingen ontvangen via het <a href="https://loket.lokaalbestuur.vlaanderen.be/login" target="_blank">Loket voor Lokale Besturen</a>, module Databank Erediensten.</p><br />
    <table style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;border: .1rem solid #cfd5dd; border-collapse: collapse;">
    <caption aria-hidden="true" style="visibility: hidden;">Melding van inzending</caption>
    <th style="padding: 1rem; border-top: .15rem solid #cfd5dd; border-left: .1rem solid #cfd5dd; border-bottom: .15rem solid #cfd5dd; border-right: .1rem dotted #cfd5dd">Details voor inzending</th>
    <th style="padding: 1rem; border-top: .15rem solid #cfd5dd; border-bottom: .15rem solid #cfd5dd; border-right: .1rem solid #cfd5dd"></th>
    ${htmlSubmissionsRows}
    </table>
    <br />
    <br />
    <p style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;">De Vlaamse overheid zet verder in op digitalisering. Alle communicatie in kader van het eredienstendecreet en het erkenningsdecreet gebeurt voortaan digitaal via het Loket voor Lokale besturen. Meer info hierover vindt u op onze <a href="https://www.vlaanderen.be/lokaal-bestuur/digitale-communicatie-met-de-vlaamse-overheid" target="_blank">webpagina</a>.</p><br />
    <p style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;">Met Vriendelijke Groet</p>
    <p style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;">Agentschap Binnenlands Bestuur</p><br /><br />
    <p style="color:gray; margin:0; line-height:1.6; font-family:sans-serif; letter-spacing:normal; font-size:14px;">Opgelet, reageren op deze mail kan niet. Voor vragen over het Loket voor Lokale Besturen, mail naar <a href="mailto:loketlokaalbestuur@vlaanderen.be" target="_blank">loketlokaalbestuur@vlaanderen.be</a>. Voor inhoudelijke vragen kan u mailen naar het algemeen mailadres <a href="mailto:binnenland@vlaanderen.be" target="_blank">binnenland@vlaanderen.be</a>.</p>
  </body>
  </html>
  `;
}

export async function processSendNotifications() {
  const bestuurseenheden = await getRelevantBestuurseenheden();
  const maxMessageAge = daysAgo(MAX_AGE);
  const emails = [];
  for (const eenheid of bestuurseenheden) {
    const email = await processSendNotificationForEenheid(eenheid, maxMessageAge);
    if(email)
      emails.push(email);
  }
  console.info(`Created ${emails.length} emails to send since ${maxMessageAge}. `);
}

async function processSendNotificationForEenheid(eenheid, maxMessageAge) {
  try {
    console.log("Fetching new submissions that need a notification to be sent...");
    const submissionInfo = await getSubmissionInfo(eenheid, maxMessageAge);

    if (!submissionInfo || submissionInfo.length === 0) {
      console.log("Looks like there are no subscriptions for submission notifications. Waiting for the next batch...");
      return;
    }

    const filteredSubmissions = filterSubmissions(submissionInfo);

    if (filteredSubmissions.length === 0) {
      console.log("No valid submissions to send after filtering.");
      return;
    }

    console.log(`Found ${filteredSubmissions.length} submission(s) that need a notification. Processing...`);

    const targetInfo = {
      targetEenheidLabel: submissionInfo[0].targetEenheidLabel,
      targetEenheid: submissionInfo[0].targetEenheid,
      emailAddress: submissionInfo[0].emailAddress
    };

    return await sendNotificationEmail(targetInfo, filteredSubmissions);
  } catch (err) {
    const errMsg = `
      There was an error for creating an worship-email to notification to: ${eenheid}.
      Error: ${err.message || err}
      Stack: ${err.stack || 'No stack trace available'}
    `;
    console.error(errMsg);
    await createError(errMsg);
  }
}

function filterSubmissions(submissionInfo) {
  const seen = new Set();
  const filtered = [];

  for (const submission of submissionInfo) {
    const isDuplicate = seen.has(submission.submissionUri);
    const isSelfSubmission = submission.targetEenheid === submission.creatorEenheid;

    if (!isDuplicate && !isSelfSubmission) {
      seen.add(submission.submissionUri);
      filtered.push({
        ...submission,
        url: addUrlPerSubmission(submission.submissionId)
      });
    }
  }

  return filtered;
}

async function sendNotificationEmail(targetInfo, submissions) {
  const { targetEenheidLabel, targetEenheid, emailAddress } = targetInfo;

  console.log(`Bundling ${submissions.length} submissions for ${targetEenheidLabel} into email notification...`);

  const email = createEmailForTarget(targetEenheidLabel, emailAddress, submissions);

  console.log(`Placing ${targetEenheidLabel}'s email notification ${email.uri} into outbox`);

  await insertEmail(submissions, email, targetEenheid);
  return email;
}

function createEmailForTarget(targetEenheidLabel, emailAddress, submissions) {
  const subject = buildEmailSubject(submissions);

  let email = newEmail(
    process.env.FROM_EMAIL_ADDRESS,
    emailAddress,
    subject,
    null
  );

  email.htmlContent = generateHtmlEmail(targetEenheidLabel, submissions);
  email.plainTextMessageContent = generatePlainTextEmail(targetEenheidLabel, submissions);
  email.uri = `http://data.lblod.info/id/emails/${email.uuid}`;
  email.bcc = getBccAddresses();

  console.log(`The following addresses are in BCC: ${email.bcc}`);

  return email;
}

function buildEmailSubject(submissions) {
  return submissions.length > 1
    ? `${submissions.length} Nieuwe inzendingen`
    : `${submissions[0].decisionTypeLabel} - Nieuwe inzending`;
}

function getBccAddresses() {
  if (!process.env.BCC_EMAIL_ADDRESSES) {
    return "";
  }

  const bccAddresses = process.env.BCC_EMAIL_ADDRESSES.split(",");
  return bccAddresses.filter(address => address.trim()).join(",");
}

function addUrlPerSubmission(submissionId) {
  const baseUrl = process.env.WORSHIP_DECISIONS_APP_BASEURL;
    return `${baseUrl}search/submissions/${submissionId}`;
  }

function daysAgo(days) {
  const now = new Date();
  now.setDate(now.getDate() - days);
  return now;
}
