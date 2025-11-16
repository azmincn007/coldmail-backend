const express = require('express');
const router = express.Router();
const statsRoutes = require('./statsRoutes');

// Register all routes
router.use('/', statsRoutes);

module.exports = router;