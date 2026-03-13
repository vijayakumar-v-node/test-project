let sqlConnection = require('../config/db');
const buildQueryService = require('../services/build-segment-query')

exports.createSegment = async (req, res) => {
    try {
        const { name, filters} = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Segment name is required' });
        }

        if (!filters || Object.keys(filters).length === 0) {
            return res.status(400).json({ message: "Segment filters are required" });
        }

        let query = `INSERT INTO segments (name, filters) VALUES (?, ?)`;
        let values = [name, JSON.stringify(filters)];
        let [result] = await sqlConnection.query(query, values);
        return res.status(200).json({ message: 'Segment created successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.getAllSegments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let [total] = await sqlConnection.query(`SELECT COUNT(*) as totalSegmentCount FROM segments`);

        if (total[0]['totalSegmentCount'] === 0) {
            return res.status(200).json({ segments: [], totalPages: 0, currentPage: page, totalSegments: 0 });
        }
        let totalPages = Math.ceil(total[0]['totalSegmentCount'] / limit);

        let query = `SELECT * FROM segments LIMIT ? OFFSET ?`;
        let values = [limit, offset];
        let [segments] = await sqlConnection.query(query, values);

        return res.status(200).json({ contacts: segments, totalPages: totalPages, currentPage: page, totalSegments: total[0]['totalSegmentCount'] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.getContactsOfSegment = async (req, res) => {
    try {
        const { id } = req.params;

        const [segments] = await sqlConnection.query(
            "SELECT filters FROM segments WHERE id = ?",
            [id]
        );

        if (!segments.length) {
            return res.status(404).json({ message: "Segment not found" });
        }

        const filters = segments[0].filters;

        if (!filters || Object.keys(filters).length === 0) {
            return res.status(400).json({ message: "Segment filters are empty" });
        }

        const { query, params } = buildQueryService(filters);

        const [contacts] = await sqlConnection.query(query, params);

        res.status(200).json(contacts);


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

