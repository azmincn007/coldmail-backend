// Test script to check UAE time
console.log('Server Local Time:', new Date().toString());
console.log('UAE Time (Asia/Dubai):', new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }));
console.log('UTC Time:', new Date().toUTCString());

// Check if TZ environment variable is set
console.log('TZ Environment Variable:', process.env.TZ || 'Not set');