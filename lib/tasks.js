import { uuid } from "mu";
import { getSubmissionInfo, insertEmail } from "../utils/queries";
import { formatDate } from '../utils/utils';

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
 * Builds an HTML template for the mail to be sent.
 * @param {String} targetEenheidLabel
 * @param {Array} submissions
 * @returns html email template
 */
export function generateHtmlEmail(targetEenheidLabel, submissions) {

  const htmlSubmissionsRows = submissions.map(({decisionTypeLabel, creatorEenheidLabel, sentDate, url}) => (
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
    <th style="padding: 1rem; border-top: .15rem solid #cfd5dd; border-left: .1rem solid #cfd5dd; border-bottom: .15rem solid #cfd5dd; border-right: .1rem dotted #cfd5dd"">Details voor inzending</th>
    <th style="padding: 1rem; border-top: .15rem solid #cfd5dd; border-bottom: .15rem solid #cfd5dd; border-right: .1rem solid #cfd5dd"></th>
    ${htmlSubmissionsRows}
    </table>
    <br />
    <br />
    <p style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;">De Vlaamse overheid zet verder in op digitalisering. Alle communicatie in kader van het eredienstendecreet en het erkenningsdecreet gebeurt voortaan digitaal via het Loket voor Lokale besturen. Meer info hierover vindt u op onze <a href="https://www.vlaanderen.be/lokaal-bestuur/digitale-communicatie-met-de-vlaamse-overheid" target="_blank">webpagina</a>.</p><br />
    <p style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;">Met Vriendelijke Groet</p>
    <p style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;">Agentschap Binnenlands Bestuur</p><br /><br />
    <p style="color:gray; margin:0; line-height:1.6; font-family:sans-serif; letter-spacing:normal; font-size:14px;">Opgelet, reageren op deze mail kan niet. Voor vragen over het Loket voor Lokale Besturen, mail naar <a href="mailto:loketlokaalbestuur@vlaanderen.be" target="_blank">loketlokaalbestuur@vlaanderen.be</a>. Voor inhoudelijke vragen kan u mailen naar het algemeen emailAddress <a href="mailto:binnenland@vlaanderen.be" target="_blank">binnenland@vlaanderen.be</a>.</p>
  </body>
  </html>
  `;
}

export async function processSendNotifications() {
  try {
    console.log("Fetching new submissions that need a notification to be sent...");
    const submissionInfo = await getSubmissionInfo();

    if (!submissionInfo || submissionInfo.length === 0) {
      console.log("Looks like there are no subscriptions for submission notifications. Waiting for the next batch...");
      return;
    }

    const submissionsByTarget = {};

    for (const { targetEenheid, targetEenheidLabel, emailAddress, decisionTypeLabel, submissionUri, creatorEenheidLabel, sentDate } of submissionInfo) {

      if (!submissionsByTarget[targetEenheid]) {
        submissionsByTarget[targetEenheid] = {
          targetEenheidLabel,
          emailAddress,
          submissions: []
        };
      }

      if (!submissionsByTarget[targetEenheid].submissions.some((existingUri) => existingUri === submissionUri) && submissionsByTarget[targetEenheid].targetEenheidLabel.toString() !== creatorEenheidLabel.toString()) {
        submissionsByTarget[targetEenheid].submissions.push({
          submissionUri,
          decisionTypeLabel,
          creatorEenheidLabel,
          sentDate,
          url : addUrlPerSubmission(submissionUri),
        });
      }
    }

    console.log(`Found ${Object.keys(submissionsByTarget).length} subscription(s) that need a notification. Processing...`);

    for (const target in submissionsByTarget) {
      const { targetEenheidLabel, emailAddress, submissions } = submissionsByTarget[target];

      console.log(`Bundling ${submissions.length} submissions for ${targetEenheidLabel} into email notification...`);

      const subject =
        submissions.length > 1
          ? `${submissions.length} Nieuwe inzendingen`
          : `${submissions[0].decisionTypeLabel} - Nieuwe inzending`;

      let email = newEmail(
        process.env.FROM_EMAIL_ADDRESS,
        emailAddress,
        subject,
        null
      );
      email.htmlContent = generateHtmlEmail(targetEenheidLabel, submissions);
      email.uri = `http://data.lblod.info/id/emails/${email.uuid}`;

      let bccAddresses = [];

      if (process.env.BCC_EMAIL_ADDRESSES) {
        bccAddresses = process.env.BCC_EMAIL_ADDRESSES.split(",");
      }

      email.bcc = bccAddresses.filter(address => address).join(",");
      console.log(`The following addresses are in BCC: ${email.bcc}`);

      console.log(`Placing ${targetEenheidLabel}'s email notification ${email.uri} into outbox`);
      await insertEmail(submissions, email, target);
    }
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Appends constructed url from related submission
 * @param {String} submissionUri
 * @returns {String} url 
 */
function addUrlPerSubmission(submissionUri) {
  const baseUrl = process.env.WORSHIP_DECISIONS_APP_BASEURL;

    const submissionId = submissionUri.split("/").pop();
    return `${baseUrl}search/submissions/${submissionId}`;
  }