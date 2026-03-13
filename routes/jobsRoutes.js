const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createJob, getAllJobs, getJobById } = require('../controllers/jobsController');
const sqlConnection = require('../config/db');
const buildQueryService = require('../services/build-segment-query');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 10, // Limit each IP to 10 requests for a minute
})

setInterval(async () => {
    try {
        const [jobs] = await sqlConnection.query(
            `SELECT * FROM jobs 
         WHERE status='pending' 
         AND scheduledAt <= NOW()`
        );

        for (const job of jobs) {
            await processJob(job);
        }
    } catch (err) {
        console.error("Scheduler error:", err);
    }
}, 5000);

async function processJob(job) {
    try {
        await sqlConnection.query(
            "UPDATE jobs SET status='processing' WHERE id=?",
            [job.id]
        );

        const contacts = await getContactsForSegment(job.segmentId);

        if (!contacts.length) {
            await sqlConnection.query(
                "UPDATE jobs SET status='failed', failure_reason=? WHERE id=?",
                ["No contacts matched segment", job.id]
            );
            return;
        }

        for (const contact of contacts) {
            console.log(
                `[Job ${job.id}] Notifying ${contact.email}: ${job.message}`
            );
        }

        await sqlConnection.query(
            "UPDATE jobs SET status='completed' WHERE id=?",
            [job.id]
        );

    } catch (err) {
        console.error(err);

        await sqlConnection.query(
            "UPDATE jobs SET status='failed', failure_reason=? WHERE id=?",
            [err.message, job.id]
        );
    }
}

async function getContactsForSegment(segmentId) {
    const [segments] = await sqlConnection.query(
        "SELECT filters FROM segments WHERE id=?",
        [segmentId]
    );

    if (!segments.length) return [];

    const filters = segments[0].filters;

    if (!filters || Object.keys(filters).length === 0) {
        return [];
    }

    const { query, params } = buildQueryService(filters);

    const [contacts] = await sqlConnection.query(query, params);

    return contacts;
}

router.post('/', limiter, createJob);
router.get('/', getAllJobs);
router.get('/:id', getJobById);

module.exports = router;