const express = require('express');
const router = express.Router();
const statsRoutes = require('./statsRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Register all routes
router.use('/', statsRoutes);

module.exports = router;