const express = require('express');
const db = require('../renderPg.js');
const router = express.Router();

router.get('/', db.getQuery);
router.post('/insertEvents', db.insertEvents);
router.post('/getMatchingSessions', db.getMatchingSessions);
router.post('/getFormatCurrentSession', db.getFormatCurrentSession);

module.exports = router;
