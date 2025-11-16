const fs = require('fs');

// Read the CSV file
const data = fs.readFileSync('companies_updated.csv', 'utf8');

// Split by lines and remove the header
const lines = data.split('\n').slice(1);

// Extract emails and filter out empty lines
const emails = lines
  .map(line => line.trim())
  .filter(line => line.length > 0);

// Count occurrences of each email
const emailCounts = {};
emails.forEach(email => {
  emailCounts[email] = (emailCounts[email] || 0) + 1;
});

// Find duplicates
const duplicates = {};
let duplicateCount = 0;

for (const [email, count] of Object.entries(emailCounts)) {
  if (count > 1) {
    duplicates[email] = count;
    duplicateCount++;
  }
}

// Print results
console.log(`Total emails: ${emails.length}`);
console.log(`Unique emails: ${Object.keys(emailCounts).length}`);
console.log(`Duplicate emails: ${duplicateCount}`);

if (duplicateCount > 0) {
  console.log('\nDuplicate emails found:');
  for (const [email, count] of Object.entries(duplicates)) {
    console.log(`${email}: ${count} times`);
  }
} else {
  console.log('\nNo duplicate emails found.');
}