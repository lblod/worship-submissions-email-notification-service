# Changelog
## 1.3.0 (2024-10-07)
- General improvements see https://github.com/lblod/worship-submissions-email-notification-service/pull/4 
  - see also: [DL-6941]

## 1.2.0 (2024-04-18)

### General maintenance
- Updating dependencies
- Adding date-fns and date-fns-tz packages
- Adding specified version in Dockerfile
- Updating documentation

### CORE
- Adjusting query variable `?submission` in favor of `?submissionUri`
- Removing mock-email feature	
- Adding formatted url directly into the submission object from each submissions with the function  `addUrlPerSubmission(submissionUri)` previously named `getLinks()`
- Fix : Submissions wont be appended twice
- Submissions made by `creatorEenheidLabel` = `targetEenheidLabel` wont be added to the bundle
- Adjusting HTML template
  - Adding appuniversum style to include a formatted table
  - Injecting table rows with each submissions information such as `sentDate`, `decisionTypeLabel`, `creatorEenheidLabel` and `url`
  - Sorting submissions in DESC order
  - Minor typo fixes
- Adding generated plain text version into email model
## 1.1.0 (2023-07-17)

- Adjusting cron pattern to run every day at 10:00 am

- RUN_INTERVAL docker env is now a String instead of a Number

## 1.0.0 (2023-06-19)

- Adding core features
