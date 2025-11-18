const cron = require('cron');

console.log('Testing cron job execution...');

// Create a simple cron job that runs every minute
const testJob = new cron.CronJob('* * * * *', () => {
    console.log('Cron job executed at:', new Date().toString());
}, null, true, 'Asia/Kolkata');

console.log('Cron job scheduled. It should run every minute.');
console.log('Press Ctrl+C to stop.');

// Keep the process running
process.stdin.resume();