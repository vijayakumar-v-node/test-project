const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createContact, getAllContacts, getContactById, updateContact, deleteContact } = require('../controllers/contactController');

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	limit: 10, // Limit each IP to 10 requests for a minute
})


router.post('/', limiter, createContact);
router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;