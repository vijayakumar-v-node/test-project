const express = require('express');
const router = express.Router();
const { createSegment, getAllSegments, getContactsOfSegment } = require('../controllers/segmentController');

router.post('/', createSegment);
router.get('/', getAllSegments);
router.get('/:id/contacts', getContactsOfSegment);

module.exports = router;