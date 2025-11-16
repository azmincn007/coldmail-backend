const mongoose = require('mongoose');
const Email = require('./Email');
const connection = require('./mongoConnection');

// Initialize the database
async function initializeDatabase() {
    try {
        await connection();
        console.log('MongoDB initialized successfully');
    } catch (error) {
        console.error('Error initializing MongoDB:', error);
        throw error;
    }
}

// Insert emails from CSV into database
async function insertEmails(emails) {
    try {
        const emailDocs = emails.map(email => ({
            email: email,
            status: 'pending'
        }));
        
        // Use insertMany with ordered: false to insert all documents, ignoring duplicates
        const result = await Email.insertMany(emailDocs, { ordered: false });
        console.log(`Inserted ${result.length} emails into database`);
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            console.log('Some emails were duplicates and were skipped');
        } else {
            console.error('Error inserting emails:', error);
            throw error;
        }
    }
}

// Get pending emails
async function getPendingEmails(limit) {
    try {
        const emails = await Email.find({ status: 'pending' }).limit(limit);
        return emails.map(email => ({
            id: email._id,
            email: email.email
        }));
    } catch (error) {
        console.error('Error getting pending emails:', error);
        throw error;
    }
}

// Update email status
async function updateEmailStatus(id, status) {
    try {
        const updateData = { status };
        if (status === 'sent') {
            updateData.sent_at = new Date();
        }
        
        const result = await Email.findByIdAndUpdate(id, updateData, { new: true });
        return result ? 1 : 0;
    } catch (error) {
        console.error('Error updating email status:', error);
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

module.exports = {
    initializeDatabase,
    insertEmails,
    getPendingEmails,
    updateEmailStatus,
    getTodaysSentCount
};