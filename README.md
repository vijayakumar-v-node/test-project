# Node.js REST API — Express + MySQL

A production-ready REST API using MySQL connection pooling, input validation and rate-limiting where required.

PROJECT SETUP :

1. Install dependacies
npm i express
npm i mysql2
npm i dotenv
npm i express-rate-limit

2. Run command 

node server.js

----------------------------------------
Test-Project Architecture:


Client (Postman / UI) 
|
Express API (REST Endpoints) 
|
MySQL DB (contacts, contact_tags , segments, jobs) 
|
Scheduler Worker (Runs every 5 seconds) 
|
Job Processor (Resolve Segment -> Fetch Contacts -> Log Notifications -> Update Job Status)

----------------------------------------

PROJECT STRUCTURE

test-project/
config/
  db.js               # MySQL pool connection

controllers/
  contactController.js   # create, list, single contact, update, delete
  jobsController.js      # create, list, single job
  segmentController.js   # create, list, get all contacts of segment

routes/
  contactRoutes.js
  jobsRoutes.js
  segmentRoutes.js

services/
  build-segment-query.js        # building a query and params for the contacts of the segment

server.js                       # Entry point

.env

package.json

------------------------------------------
TABLE STRUCTURE

CREATE TABLE contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    region ENUM('North','South','East','West') NOT NULL,
    lastPurchaseDate DATE,
    active INT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contactId BIGINT NOT NULL,
    tagName VARCHAR(100) NOT NULL,

    FOREIGN KEY (contactId) REFERENCES contacts(id)
);

CREATE TABLE segments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    filters JSON NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    segmentId BIGINT NOT NULL,
    message TEXT NOT NULL,
    scheduledAt DATETIME NOT NULL,
    status ENUM('pending','processing','completed','failed') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (segmentId) REFERENCES segments(id)
);


CREATE INDEX idx_contacts_region ON contacts(region);
CREATE INDEX idx_contacts_last_purchase ON contacts(lastPurchaseDate);
CREATE INDEX idx_contact_tags_tag ON contact_tags(tagName);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_schedule ON jobs(scheduledAt);

------------------------------


