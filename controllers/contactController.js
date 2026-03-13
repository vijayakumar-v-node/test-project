const sqlConnection = require('../config/db');

exports.createContact = async (req, res) => {
    try {
        const { name, email, region, tags = [], lastPurchaseDate = null } = req.body;
        if (!name || !email || !region) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email' });
        }
        if (!['North', 'South', 'East', 'West'].includes(region)) {
            return res.status(400).json({ message: 'Invalid region' });
        }
        let query = `INSERT INTO contacts (name, email, region, lastPurchaseDate, active) VALUES (?, ?, ?, ?, 1)`;
        let values = [name, email, region, lastPurchaseDate];
        let [result] = await sqlConnection.query(query, values);

        let tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',') : []);
        for (let tag of tagsArray) {
            let query = `INSERT INTO contact_tags (contactId, tagName) VALUES (?, ?)`;
            let values = [result.insertId, tag];
            let [resultTag] = await sqlConnection.query(query, values);
        }

        return res.status(200).json({ message: 'Contact created successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.getAllContacts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let [total] = await sqlConnection.query(`SELECT COUNT(*) as totalContactCount FROM contacts WHERE active = 1`);

        if (total[0]['totalContactCount'] === 0) {
            return res.status(200).json({ contacts: [], totalPages: 0, currentPage: page, totalContacts: 0 });
        }
        let totalPages = Math.ceil(total[0]['totalContactCount'] / limit);

        let query = `SELECT * FROM contacts WHERE active = 1 LIMIT ? OFFSET ?`;
        let values = [limit, offset];
        let [contacts] = await sqlConnection.query(query, values);

        return res.status(200).json({ contacts: contacts, totalPages: totalPages, currentPage: page, totalContacts: total[0]['totalContactCount'] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Contact ID is required' });
        }
        let checkContactQuery = `SELECT * FROM contacts WHERE id = ? AND active = 1`;
        let checkContactvalues = [id];
        let [contact] = await sqlConnection.query(checkContactQuery, checkContactvalues);
        if (contact.length === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        let checkTagsOfContact = `SELECT tagName FROM contact_tags WHERE contactId = ?`;
        let checkTagsOfContactvalues = [id];
        let [tags] = await sqlConnection.query(checkTagsOfContact, checkTagsOfContactvalues);
        if (tags.length > 0) {
            contact[0].tags = tags.map(tag => tag.tagName);
        }
        return res.status(200).json({ contact: contact[0] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, region, tags = [], lastPurchaseDate } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Contact ID is required' });
        }
        if (!name || !region) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!['North', 'South', 'East', 'West'].includes(region)) {
            return res.status(400).json({ message: 'Invalid region' });
        }
        let updateContactQuery = `UPDATE contacts SET name = ?, region = ?, lastPurchaseDate = ? WHERE id = ?`;
        let updateContactvalues = [name, region, lastPurchaseDate, id];
        let [result] = await sqlConnection.query(updateContactQuery, updateContactvalues);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Contact not updated' });
        }
        let tagsArray = tags.split(',');
        for (let tag of tagsArray) {
            let checkTagQuery = `SELECT id FROM contact_tags WHERE contactId = ? AND tagName = ?`;
            let checkTagvalues = [id, tag];
            let [checkTag] = await sqlConnection.query(checkTagQuery, checkTagvalues);
            if (checkTag.length === 0) {
                let query = `INSERT INTO contact_tags (contactId, tagName) VALUES (?, ?)`;
                let values = [id, tag];
                let [resultTag] = await sqlConnection.query(query, values);
            }
        }
        return res.status(200).json({ message: 'Contact updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Contact ID is required' });
        }
        let deleteContactQuery = `UPDATE contacts SET active = 0 WHERE id = ?`;
        let deleteContactvalues = [id];
        let [result] = await sqlConnection.query(deleteContactQuery, deleteContactvalues);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Contact not deleted' });
        }
        let deleteTagsOfContactQuery = `DELETE FROM contact_tags WHERE contactId = ?`;
        let deleteTagsOfContactvalues = [id];
        let [resultTags] = await sqlConnection.query(deleteTagsOfContactQuery, deleteTagsOfContactvalues);
        if (resultTags.affectedRows === 0) {
            return res.status(400).json({ message: 'Tags not deleted' });
        }
        return res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

