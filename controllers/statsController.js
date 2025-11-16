const Email = require('../Email');

// Get email statistics
async function getEmailStats(req, res) {
    try {
        const stats = await Email.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Convert to the expected format
        const result = {
            total: 0,
            pending: 0,
            sent: 0,
            failed: 0
        };
        
        stats.forEach(item => {
            result[item._id] = item.count;
            result.total += item.count;
        });
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get today's sent count
async function getTodaysSentCount(req, res) {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const count = await Email.countDocuments({
            status: 'sent',
            sent_at: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });
        
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getEmailStats,
    getTodaysSentCount
};