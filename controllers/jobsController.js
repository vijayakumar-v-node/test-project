let sqlConnection = require('../config/db');

exports.createJob = async (req, res) => {
    try {
        const { segmentId, message, scheduledAt } = req.body;

        const scheduleDate = new Date(scheduledAt);

        if (scheduleDate <= new Date()) {
            return res.status(400).json({
                message: "scheduledAt must be a future time",
            });
        }

        const [result] = await sqlConnection.query(
            `INSERT INTO jobs (segmentId, message, scheduledAt, status)
                 VALUES (?, ?, ?, 'pending')`,
            [segmentId, message, scheduledAt]
        );

        return res.status(200).json({ jobId: result.insertId, status: "pending", });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.getAllJobs = async (req, res) => {
    try {
        let [total] = await sqlConnection.query(`SELECT COUNT(*) as jobsCount FROM jobs`);

        if (total[0]['jobsCount'] === 0) {
            return res.status(200).json({ jobs: [], totalJobs: 0 });
        }

        let query = `SELECT * FROM jobs`;
        let [jobsList] = await sqlConnection.query(query);

        return res.status(200).json({ jobs: jobsList, totalJobs: total[0]['jobsCount'] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Job ID is required' });
        }
        let checkJobQuery = `SELECT * FROM jobs WHERE id = ? AND active = 1`;
        let checkJobvalues = [id];
        let [jobDetail] = await sqlConnection.query(checkJobQuery, checkJobvalues);
        if (jobDetail.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        return res.status(200).json({ job: jobDetail[0] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}