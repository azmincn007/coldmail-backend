const cron = require('cron');
const { getPendingEmails, updateEmailStatus, getTodaysSentCount } = require('./database');
const { createTransporter, loadEmailTemplate, sendEmail } = require('./emailService');

// Send batch of emails
async function sendEmailBatch() {
    console.log('=== EMAIL BATCH PROCESS STARTED ===');
    console.log('Current time:', new Date().toString());
    
    // Check if we're in development mode
    const isDevelopment = process.env.IS_DEVELOPMENT === 'true';
    console.log(`IS_DEVELOPMENT: ${isDevelopment}`);
    
    // Check daily limit (skip in development mode)
    let batchSize;
    if (!isDevelopment) {
        const dailyLimit = parseInt(process.env.DAILY_EMAIL_LIMIT || 400);
        const todaysSentCount = await getTodaysSentCount();
        
        if (todaysSentCount >= dailyLimit) {
            console.log(`Daily limit of ${dailyLimit} emails reached. Stopping email batches.`);
            console.log('=== EMAIL BATCH PROCESS ENDED ===');
            return false; // Return false to indicate we've reached the limit
        }
        
        const remainingLimit = dailyLimit - todaysSentCount;
        batchSize = Math.min(15, remainingLimit); // Changed to 15 emails per batch
        
        console.log(`Processing email batch. Today's sent count: ${todaysSentCount}, Remaining limit: ${remainingLimit}, Batch size: ${batchSize}`);
    } else {
        // In development mode, use a fixed batch size
        batchSize = 15;
        console.log(`DEVELOPMENT MODE: Processing email batch with fixed size: ${batchSize}`);
    }
    
    try {
        let emailsToSend;
        if (isDevelopment) {
            // In development mode, only send to azminsazz@gmail.com
            emailsToSend = [{ id: 'dev-email', email: 'azminsazz@gmail.com' }];
            console.log('DEVELOPMENT MODE: Sending email only to azminsazz@gmail.com');
        } else {
            // In production mode, get pending emails from database
            emailsToSend = await getPendingEmails(batchSize);
            
            if (emailsToSend.length === 0) {
                console.log('No pending emails to send.');
                console.log('=== EMAIL BATCH PROCESS ENDED ===');
                return false; // Return false to indicate no more emails
            }
        }
        
        console.log(`Preparing to send ${emailsToSend.length} emails`);
        
        // Create transporter and load template
        console.log('Creating email transporter...');
        const transporter = createTransporter();
        console.log('Loading email template...');
        const template = await loadEmailTemplate();
        
        // Counters for statistics
        let successfulSends = 0;
        let failedSends = 0;
        
        // Send emails
        for (const emailRecord of emailsToSend) {
            console.log(`Sending email to: ${emailRecord.email}`);
            const result = await sendEmail(emailRecord.email, transporter, template);
            console.log(`Email send result:`, result);
            
            // Update status in database (skip for development mode)
            if (!isDevelopment && result.success) {
                await updateEmailStatus(emailRecord.id, 'sent');
                successfulSends++;
            } else if (!isDevelopment) {
                await updateEmailStatus(emailRecord.id, 'failed');
                failedSends++;
            } else if (isDevelopment) {
                // In development mode, count as successful
                successfulSends++;
            }
        }
        
        console.log(`Sent ${emailsToSend.length} emails in this batch.`);
        
        // Show statistics after batch completion
        if (!isDevelopment) {
            const todaysSentCount = await getTodaysSentCount();
            const dailyLimit = parseInt(process.env.DAILY_EMAIL_LIMIT || 400);
            const remainingLimit = dailyLimit - todaysSentCount;
            
            console.log('=== BATCH STATISTICS ===');
            console.log(`Successful sends: ${successfulSends}`);
            console.log(`Failed sends: ${failedSends}`);
            console.log(`Today's total sent: ${todaysSentCount}`);
            console.log(`Remaining daily cap: ${remainingLimit}`);
            console.log('========================');
        }
        
        return true; // Return true to indicate batch was processed
    } catch (error) {
        console.error('Error sending email batch:', error);
        return false;
    }
    
    console.log('=== EMAIL BATCH PROCESS ENDED ===');
}

// Continuous batch sending with 10-minute intervals
async function startContinuousBatchSending() {
    console.log('=== STARTING CONTINUOUS BATCH SENDING ===');
    
    // Check if we're in development mode
    const isDevelopment = process.env.IS_DEVELOPMENT === 'true';
    
    // Run batches continuously with 10-minute intervals
    const batchInterval = setInterval(async () => {
        const shouldContinue = await sendEmailBatch();
        
        // If we've reached the daily limit or no more emails, stop the interval
        if (!shouldContinue) {
            clearInterval(batchInterval);
            console.log('Stopped continuous batch sending.');
            
            // If not in development mode, show final statistics
            if (!isDevelopment) {
                const todaysSentCount = await getTodaysSentCount();
                const dailyLimit = parseInt(process.env.DAILY_EMAIL_LIMIT || 400);
                const remainingLimit = dailyLimit - todaysSentCount;
                
                console.log('=== FINAL DAILY STATISTICS ===');
                console.log(`Today's total sent: ${todaysSentCount}`);
                console.log(`Remaining daily cap: ${remainingLimit}`);
                console.log('===============================');
            }
        }
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
    
    // Run first batch immediately
    setTimeout(async () => {
        await sendEmailBatch();
    }, 1000); // Wait 1 second to ensure everything is initialized
    
    console.log('Continuous batch sending started. First batch will run in 1 second, then every 10 minutes.');
    
    return batchInterval;
}

// Schedule email sending (runs every 10 minutes during business hours)
function scheduleEmails() {
    console.log('=== SCHEDULING EMAIL JOBS ===');
    
    // Instead of cron-based scheduling, start continuous batch sending
    const batchProcess = startContinuousBatchSending();
    
    console.log('=== EMAIL SCHEDULING SETUP COMPLETE ===');
    
    return batchProcess;
}

module.exports = { scheduleEmails, sendEmailBatch, startContinuousBatchSending };