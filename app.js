import bodyParser from "body-parser";
import { CronJob } from "cron";
import { app } from "mu";
import { processSendNotifications } from "./lib/tasks";

const INTERVAL = process.env.RUN_INTERVAL
  ? process.env.RUN_INTERVAL
  : `0 10 * * *`;

const job = new CronJob(INTERVAL, processSendNotifications);

job.start();
console.log(
  `Registered a task for fetching and processing subscription notifications at ${new Date().toISOString()}`
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

app.post('/debug/jobs', async function(req, res) {
  console.log('Manual triggering of jobs');
  processSendNotifications();
  res.status(201).send();
});
