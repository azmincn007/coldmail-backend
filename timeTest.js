require('dotenv').config();

// Test to check actual system time
console.log('=== SYSTEM TIME TEST ===');
console.log('Current UTC time:', new Date().toUTCString());
console.log('Current local time:', new Date().toString());
console.log('Current local time (formatted):', new Date().toLocaleString());
console.log('Current hour (local):', new Date().getHours());

// Check environment variables
console.log('\n=== ENVIRONMENT VARIABLES ===');
console.log('TZ:', process.env.TZ || 'Not set (using system default)');
console.log('TIME_WINDOW_START_1:', process.env.TIME_WINDOW_START_1 || 'Not set');
console.log('TIME_WINDOW_END_1:', process.env.TIME_WINDOW_END_1 || 'Not set');
console.log('TIME_WINDOW_START_2:', process.env.TIME_WINDOW_START_2 || 'Not set');
console.log('TIME_WINDOW_END_2:', process.env.TIME_WINDOW_END_2 || 'Not set');

// Test time window function
console.log('\n=== TIME WINDOW CHECK ===');
function isWithinTimeWindow() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Time window 1: 10-12 AM
    const window1Start = parseInt(process.env.TIME_WINDOW_START_1 || 10);
    const window1End = parseInt(process.env.TIME_WINDOW_END_1 || 12);
    
    // Time window 2: 1-3 PM
    const window2Start = parseInt(process.env.TIME_WINDOW_START_2 || 13);
    const window2End = parseInt(process.env.TIME_WINDOW_END_2 || 15);
    
    console.log(`Current hour: ${currentHour}`);
    console.log(`Window 1: ${window1Start}-${window1End}`);
    console.log(`Window 2: ${window2Start}-${window2End}`);
    
    const inWindow1 = (currentHour >= window1Start && currentHour < window1End);
    const inWindow2 = (currentHour >= window2Start && currentHour < window2End);
    
    console.log(`In Window 1 (${window1Start}-${window1End}): ${inWindow1}`);
    console.log(`In Window 2 (${window2Start}-${window2End}): ${inWindow2}`);
    
    return inWindow1 || inWindow2;
}

const withinWindow = isWithinTimeWindow();
console.log(`\nIs current time within configured windows: ${withinWindow}`);

if (!withinWindow) {
    console.log('\nNOTE: The cron job will only execute emails when the current time is within your configured windows.');
    console.log('Your windows are: 10-12 AM and 1-3 PM');
    console.log('If the current time is outside these windows, the job will start but not send emails.');
}