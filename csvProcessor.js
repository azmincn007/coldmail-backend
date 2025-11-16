const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Process the CSV file and extract emails
function processCSV() {
    return new Promise((resolve, reject) => {
        const emails = [];
        const csvPath = path.join(__dirname, 'companies_updated.csv');
        
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                // Assuming the first column is 'Email'
                const email = row.Email || row.email;
                if (email && email.includes('@')) {
                    emails.push(email);
                }
            })
            .on('end', () => {
                console.log(`CSV file processed successfully. Found ${emails.length} emails.`);
                resolve(emails);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

module.exports = { processCSV };