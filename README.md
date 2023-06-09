
<a name="readme-top"></a>

<br />
<div align="center">
  <h1 align="center">Worship submissions email notification service </h1>
  <p align="center">
    This service is a Node.js application that periodically watches for new submissions and prepares emails for delivery through `deliver-email-service`. It retrieves information about submissions, constructs email messages, and places them in the appropriate outbox for further processing.
    <br />
    <a href="https://github.com/lblod/worship-submissions-email-notification-service/issue/page">Report Bug</a>
    ·
    <a href="https://github.com/lblod/worship-submissions-email-notification-service/PR-page">Open PR</a>
  </p>
</div>


## 📖 Description

 - `Bestuurseenheden (Administrative-unit)` should receive an email (when they subscribed) when new submissions are available for them in [app-worship-decisions-database](https://github.com/lblod/app-worship-decisions-database)
 - Periodically fetches for new submissions that require notification to be sent.
 - Constructs html email messages with relevant information from submissions.
 - Handles email address extraction from submissions and other sources.
 - Places constructed email messages into the outbox for delivery.


### 📦 Related services
The following services are closely related to this one:

- [deliver-email-service](https://github.com/redpencilio/deliver-email-service)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## ⏩ Quick setup
### 🐋 Docker-compose.yml
yml`:
```
services:
  worship-submissions-email-notification:
    image: lblod/worship-submissions-email-notification-service:latest
    environment:
      RUN_INTERVAL: 5
      OUTBOX_FOLDER_URI: "http://data.lblod.info/id/mail-folders/2"
      FROM_EMAIL_ADDRESS: "Agentschap Binnenlands Bestuur Vlaanderen <noreply-binnenland@vlaanderen.be>"
      WORSHIP_DECISIONS_APP_BASEURL: "https://databankerediensten.lokaalbestuur.vlaanderen.be/"
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## 🔑 Environment variables

| ENV                       | Description                                                                                                     | Default | Required |
|---|---|---|---|
| FROM_EMAIL_ADDRESS        | The email address added in the 'from' header of the sent mail                                                    |         | X        |
| WORSHIP_DECISIONS_APP_BASEURL| Base URL of the Worship Decisions Database app, used to create a working link to the message mentioned in the email|         | X        |
| OUTBOX_FOLDER_URI         | URI of the email outbox folder where the prepared messages must be stored                                        |         | X        |
| MU_APPLICATION_GRAPH      | The URI of the application graph in which the service operates                                                   |         |         |
| MU_SPARQL_ENDPOINT        | The SPARQL endpoint URL for querying data                                                                        |         |         |
| MU_SPARQL_UPDATEPOINT     | The SPARQL endpoint URL for performing SPARQL updates                                                            |         |         |
| BCC_EMAIL_ADDRESSES       | Recipients of emails that should be in BCC (Blind Carbon Copy)                                                    |         |          |
| RUN_INTERVAL              | How frequently the service should run to send email notifications (in minutes)                                   | 5       |          |
| MAX_MESSAGE_AGE           | Maximum age of the messages requested from the API (in days)                                                     | 3       |          |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🐸 Gotcha's

When set in a stack, if you want your email to be delivered you'll need to add the [deliver-email-service](https://github.com/redpencilio/deliver-email-service)
Basically, it looks at the outbox and if there is pending emails, it delivers it.

You'll need few things in order to have a full e-mailing flow :
- The right services in your `docker-compose.yml`

```yaml
  deliver-email-service:
    image: redpencil/deliver-email-service:0.2.0
    environment:
      MAILBOX_URI: "http://data.lblod.info/id/mailboxes/1"
    labels:
      - "logging=true"
    restart: always
    logging: *default-logging
  worship-submissions-email-notification-service:
    ...
```

- Adding `http://mu.semte.ch/graphs/system/email` to the `resource_types` array in the appropriate ACL in your `config.ex` file in the authorization service. (see [mu-authorization](https://github.com/mu-semtech/mu-authorization) documentation)

- Adding a new mailbox migration in your migration folder within the stack app _(app-worship-decisions-database for example)_ (see [mu-migrations-service](https://github.com/mu-semtech/mu-migrations-service) documentation)

```sparql
INSERT DATA {
  GRAPH <http://mu.semte.ch/graphs/system/email> {
    <http://data.lblod.info/id/mailboxes/1> a <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#Mailbox>;
       <http://mu.semte.ch/vocabularies/core/uuid> "cf9cb7e4-9a00-4855-9ee0-e8e3bbeba9e9";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> <http://data.lblod.info/id/mail-folders/1>;
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> <http://data.lblod.info/id/mail-folders/2>;
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> <http://data.lblod.info/id/mail-folders/3>;
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> <http://data.lblod.info/id/mail-folders/4>;
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> <http://data.lblod.info/id/mail-folders/5>;
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#hasPart> <http://data.lblod.info/id/mail-folders/6>.

    <http://data.lblod.info/id/mail-folders/1> a <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Folder>;
       <http://mu.semte.ch/vocabularies/core/uuid> "891c67e5-4719-47f8-aec2-d898ba2c09e8";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#title> "inbox";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#description> "Your incoming mail goes here.".

    <http://data.lblod.info/id/mail-folders/2> a <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Folder>;
       <http://mu.semte.ch/vocabularies/core/uuid> "786a8cb0-4452-40f5-b8d8-046dd2d63281";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#title> "outbox";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#description> "Your outgoing mail goes here.".

    <http://data.lblod.info/id/mail-folders/3> a <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Folder>;
       <http://mu.semte.ch/vocabularies/core/uuid> "a6fb03f9-11be-4401-9d8f-b4dc0e9df5ee";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#title> "sentbox";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#description> "Your sent mail goes here.".


    <http://data.lblod.info/id/mail-folders/4> a <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Folder>;
       <http://mu.semte.ch/vocabularies/core/uuid> "a430a848-e595-49fa-bc11-f5579605877f";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#title> "sending";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#description> "Your mail goes here while being sent.".

    <http://data.lblod.info/id/mail-folders/5> a <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Folder>;
       <http://mu.semte.ch/vocabularies/core/uuid> "0cb108a9-1c0d-4c0a-bf53-60e304116e47";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#title> "drafts";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#description> "Your draft goes here.".

    <http://data.lblod.info/id/mail-folders/6> a <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Folder>;
       <http://mu.semte.ch/vocabularies/core/uuid> "70c0baba-17a0-11eb-adc1-0242ac120002";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#title> "failbox";
       <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#description> "Your email that failed while sending goes here.".

  }
}
```

You can then check the mailfolders, there should be 6.

```sparql
PREFIX nmo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#>
PREFIX fni: <http://www.semanticdesktop.org/ontologies/2007/03/22/fni#>
PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>

SELECT ?mailfolders
  WHERE {
    GRAPH <http://mu.semte.ch/graphs/system/email> {
      <http://data.lblod.info/id/mailboxes/1> nie:hasPart ?mailfolders.
    }
  }
```   

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### 🔬 Testing

This app comes with mock routes `/mock-insert-single` and `/mock-insert-multiple`, so you can test if the dummy email is inserted in the database by checking the logs or querying it.

```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX nmo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
SELECT ?email WHERE {
  GRAPH <http://mu.semte.ch/graphs/system/email> {
    ?email rdf:type nmo:Email ;
          mu:uuid "<PROVIDE_UUID_HERE>" .
  }
}
```

Works the same for retrieving non-dummy emails.

As testing can be messy, you can delete mock emails by running this query, uuid should be replaced by the one you want to delete.

```sparql
DELETE {
    GRAPH <http://mu.semte.ch/graphs/system/email> {
      <http://data.lblod.info/id/emails/uuid> ?p ?o .
    }
  }
  WHERE {
    GRAPH <http://mu.semte.ch/graphs/system/email> {
      <http://data.lblod.info/id/emails/uuid> ?p ?o .
    }
  }
```

If you have issues finding your service in the browser you can use the container IP address by doing :

```bash
docker ps | grep worship-submissions-email-notification-service | awk '{print $1}' | xargs -I{} docker inspect {} | grep -oP '(?<="IPAddress": ")[^"]+'
```

You can also use [app-deliver-email](https://github.com/aatauil/app-deliver-email/) as a backend to test this service by simply adding it to the stack. [See Quick setup](#quick-setup)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
  
### API 

**GET** `/mock-insert-single` Initiate a dummy email insert about one submission in outbox.

**GET** `/mock-insert-multiple` Initiate a dummy email insert about multiple submissions in outbox.

Returns **201 Created** if the email insert process was successful.

Returns **500 Bad Request** if something unexpected went wrong while email inserting process.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
