require('dotenv').config();
const mongoose = require('mongoose');
const Email = require('./Email');

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect("mongodb+srv://azminsazz:azmin2000@cluster0.tsyhhu4.mongodb.net/Cold-Email?retryWrites=true&w=majority");
        console.log("MongoDB connection successful");
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return false;
    }
}

// Get email statistics
async function getEmailStats() {
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
        
        return result;
    } catch (error) {
        console.error('Error getting email statistics:', error);
        throw error;
    }
}

// Get today's sent count
async function getTodaysSentCount() {
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
        
        return count;
    } catch (error) {
        console.error('Error getting today\'s sent count:', error);
        throw error;
    }
}

// Display email statistics
async function displayEmailStats() {
    console.log('=== EMAIL STATISTICS ===');
    
    try {
        // Get overall statistics
        const stats = await getEmailStats();
        
        console.log(`Total Emails: ${stats.total}`);
        console.log(`Pending Emails: ${stats.pending}`);
        console.log(`Sent Emails: ${stats.sent}`);
        console.log(`Failed Emails: ${stats.failed}`);
        
        // Get today's sent count
        const todaysSentCount = await getTodaysSentCount();
        console.log(`Sent Today: ${todaysSentCount}`);
        
        console.log('========================');
    } catch (error) {
        console.error('Error displaying email statistics:', error);
    }
}

// Main function
async function main() {
    console.log('Connecting to database...');
    
    const isConnected = await connectToDatabase();
    
    if (isConnected) {
        await displayEmailStats();
        mongoose.connection.close();
        console.log('Database connection closed.');
    } else {
        console.log('Failed to connect to database. Exiting.');
        process.exit(1);
    }
}

// Run the script
main();