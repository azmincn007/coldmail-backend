const express = require('express');
const router = express.Router();
const { getEmailStats, getTodaysSentCount } = require('../controllers/statsController');

// Define routes
router.get('/stats', getEmailStats);
router.get('/today', getTodaysSentCount);

module.exports = router;