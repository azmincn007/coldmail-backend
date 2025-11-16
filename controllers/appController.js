const { initializeDatabase, insertEmails } = require('../database');
const { processCSV } = require('../csvProcessor');
const { scheduleEmails, sendEmailBatch } = require('../scheduler');

// Initialize the application
async function initializeApp() {
    try {
        // Initialize database
        await initializeDatabase();
        
        // Check if we're in development mode
        const isDevelopment = process.env.IS_DEVELOPMENT === 'true';
        
        if (isDevelopment) {
            // In development mode, only insert the test email
            console.log('DEVELOPMENT MODE: Inserting only test email');
            await insertEmails(['azminsazz@gmail.com']);
            
            // In development mode, also trigger an immediate email send for testing
            console.log('DEVELOPMENT MODE: Triggering immediate email send for testing');
            setTimeout(() => {
                sendEmailBatch();
            }, 5000); // Wait 5 seconds to ensure everything is initialized
        } else {
            // In production mode, process CSV and insert all emails
            const emails = await processCSV();
            await insertEmails(emails);
        }
        
        // Start the scheduler
        const scheduler = scheduleEmails();
        
        console.log('Application initialized successfully');
        return scheduler;
    } catch (error) {
        console.error('Error initializing application:', error);
        throw error;
    }
}

module.exports = {
    initializeApp
};