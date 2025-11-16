const cron = require('cron');
const { getPendingEmails, updateEmailStatus, getTodaysSentCount } = require('./database');
const { createTransporter, loadEmailTemplate, sendEmail } = require('./emailService');

// Check if current time is within allowed time windows
function isWithinTimeWindow() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Time window 1: 9-11 AM
    const window1Start = parseInt(process.env.TIME_WINDOW_START_1 || 9);
    const window1End = parseInt(process.env.TIME_WINDOW_END_1 || 11);
    
    // Time window 2: 1-2 PM
    const window2Start = parseInt(process.env.TIME_WINDOW_START_2 || 13);
    const window2End = parseInt(process.env.TIME_WINDOW_END_2 || 14);
    
    return (currentHour >= window1Start && currentHour < window1End) || 
           (currentHour >= window2Start && currentHour < window2End);
}

// Send batch of emails
async function sendEmailBatch() {
    console.log('Starting email batch send process...');
    
    // Check if we're in development mode
    const isDevelopment = process.env.IS_DEVELOPMENT === 'true';
    console.log(`IS_DEVELOPMENT: ${isDevelopment}`);
    
    // Only check time window in production mode
    if (!isDevelopment) {
        // Check if we're within allowed time window
        if (!isWithinTimeWindow()) {
            console.log('Outside of allowed time window. Skipping email batch.');
            return;
        }
    } else {
        console.log('DEVELOPMENT MODE: Skipping time window check.');
    }
    
    // Check daily limit (skip in development mode)
    let batchSize;
    if (!isDevelopment) {
        const dailyLimit = parseInt(process.env.DAILY_EMAIL_LIMIT || 400);
        const todaysSentCount = await getTodaysSentCount();
        
        if (todaysSentCount >= dailyLimit) {
            console.log(`Daily limit of ${dailyLimit} emails reached. Skipping email batch.`);
            return;
        }
        
        const remainingLimit = dailyLimit - todaysSentCount;
        batchSize = Math.min(15, remainingLimit); // Changed to 15 emails per batch
        
        console.log(`Processing email batch. Remaining limit: ${remainingLimit}, Batch size: ${batchSize}`);
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
                return;
            }
        }
        
        console.log(`Preparing to send ${emailsToSend.length} emails`);
        
        // Create transporter and load template
        console.log('Creating email transporter...');
        const transporter = createTransporter();
        console.log('Loading email template...');
        const template = await loadEmailTemplate();
        
        // Send emails
        for (const emailRecord of emailsToSend) {
            console.log(`Sending email to: ${emailRecord.email}`);
            const result = await sendEmail(emailRecord.email, transporter, template);
            console.log(`Email send result:`, result);
            
            // Update status in database (skip for development mode)
            if (!isDevelopment && result.success) {
                await updateEmailStatus(emailRecord.id, 'sent');
            } else if (!isDevelopment) {
                await updateEmailStatus(emailRecord.id, 'failed');
            }
        }
        
        console.log(`Sent ${emailsToSend.length} emails in this batch.`);
    } catch (error) {
        console.error('Error sending email batch:', error);
    }
}

// Schedule email sending (runs every 10 minutes during business hours)
function scheduleEmails() {
    // Cron expression: "0 */10 9-11,13-14 * * *" 
    // - 0: At 0 seconds
    // - */10: Every 10 minutes
    // - 9-11,13-14: Hours 9-11 and 13-14 (9-11 AM and 1-2 PM)
    // - *: Any day of month
    // - *: Any month
    // - *: Any day of week
    const emailJob = new cron.CronJob('0 */10 9-11,13-14 * * *', sendEmailBatch);
    
    emailJob.start();
    console.log('Email scheduler started. Will send emails during allowed time windows.');
    
    return emailJob;
}

module.exports = { scheduleEmails, sendEmailBatch };