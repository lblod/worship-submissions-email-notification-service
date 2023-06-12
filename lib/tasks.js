import { uuid } from "mu";
import { getSubmissionInfo, insertEmail } from "../utils/queries";

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
 * @param {Array} submissionUrls
 * @returns html email template
 */
export function generateHtmlEmail(targetEenheidLabel, submissionUrls) {

  const htmlSubmissionLink = submissionUrls.map(submission => (
      `<p><a href="${submission}" target="_blank" style="letter-spacing:normal;line-height:100%;text-align:center;text-decoration:none;color:#ffffff;background-color:#1069C9;padding:15px 20px;font-size:16px;border:none;cursor:pointer; font-family:sans-serif;">Bekijk nieuw inzending</a></p><br /><br />`
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
    <p style="margin:0; font-family:sans-serif; letter-spacing:normal; line-height:1.6;">Uw bestuur &quot;${targetEenheidLabel}&quot; heeft een nieuwe inzending ontvangen via het <a href="https://loket.lokaalbestuur.vlaanderen.be/login" target="_blank">module Databank Erediensten</a>.</p><br />
    ${htmlSubmissionLink}
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

    for (const queryData of submissionInfo) {
      const { targetEenheid, targetEenheidLabel, emailAddress, documentType, submission } = queryData;

      if (!submissionsByTarget[targetEenheid]) {
        submissionsByTarget[targetEenheid] = {
          targetEenheidLabel,
          emailAddress,
          documentType,
          submissions: []
        };
      }

      if (!submissionsByTarget[targetEenheid].submissions.includes(submission)) {
        submissionsByTarget[targetEenheid].submissions.push(submission);
      }
    }

    console.log(`Found ${Object.keys(submissionsByTarget).length} subscription(s) that need a notification. Processing...`);

    for (const target in submissionsByTarget) {
      const { targetEenheidLabel, emailAddress, documentType, submissions } = submissionsByTarget[target];

      console.log(`Bundling ${submissions.length} submissions into email notification...`);

      const subject =
        submissions.length > 1
          ? `${submissions.length} Nieuwe inzendingen`
          : `${documentType} - Nieuwe inzending`;
      const link = getLink(submissions);

      let email = newEmail(
        process.env.FROM_EMAIL_ADDRESS,
        emailAddress,
        subject,
        null
      );
      email.htmlContent = generateHtmlEmail(targetEenheidLabel, link);
      email.uri = `http://data.lblod.info/id/emails/${email.uuid}`;

      let bccAddresses = [];

      if (process.env.BCC_EMAIL_ADDRESSES) {
        bccAddresses = process.env.BCC_EMAIL_ADDRESSES.split(",");
      }

      email.bcc = bccAddresses.filter(address => address).join(",");
      console.log(`The following addresses are in BCC: ${email.bcc}`);

      console.log(`Placing user notification '${subject}' into outbox`);
      await insertEmail(submissions, email, target);
    }
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * 
 * @param {Array} submissions 
 * @returns Array
 */
function getLink(submissions) {
  const baseUrl = process.env.WORSHIP_DECISIONS_APP_BASEURL;
  
  const links = submissions.map(submission => {
    const submissionId = submission.split("/").pop();
    return `${baseUrl}search/submissions/${submissionId}`;
  });

  return links;
}
