import bodyParser from "body-parser";
import { CronJob } from "cron";
import { app } from "mu";
import { processSendNotifications } from "./lib/tasks";
import {
  multipleSubmissionsMockEmail,
  singleSubmissionMockEmail,
} from "./utils/mock-email";
import { insertEmail } from "./utils/queries";

const INTERVAL = process.env.RUN_INTERVAL
  ? parseInt(process.env.RUN_INTERVAL)
  : 5;

const job = new CronJob(`*/${INTERVAL} * * * *`, processSendNotifications);

job.start();
console.log(
  `Registered a task for fetching and processing subscription notifications every ${INTERVAL} minutes`
);

app.use(
  bodyParser.json({
    type: function (req) {
      return req.get("content-type").startsWith("application/json");
    },
  })
);

app.get("/", function (req, res) {
  res.send("Hello from worship-submissions-email-notification-service");
});

/**
 * For testing purposes
 */
app.get("/mock-insert-single", async (req, res) => {
  try {
    console.log("Testing /mock-insert-single, inserting dummy email ...");
    const email = singleSubmissionMockEmail();
    await insertEmail("http://example.com", email, "foo");
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/mock-insert-multiple", async (req, res) => {
  try {
    console.log("Testing /mock-insert-multiple, inserting dummy email ...");
    const email = multipleSubmissionsMockEmail();
    await insertEmail(
      ["http://example.com", "http://example.com", "http://example.com"],
      email,
      "foo"
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
