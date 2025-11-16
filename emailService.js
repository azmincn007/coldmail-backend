const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Create a transporter object using SMTP transport
function createTransporter() {
    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
    }
    
    // Check if we're using Gmail (based on the host or user domain)
    const isGmail = process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@gmail.com');
    
    if (isGmail) {
        // Gmail-specific configuration
        console.log('Using Gmail transport configuration');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Generic SMTP configuration
        console.log('Using generic SMTP transport configuration');
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
}

// Load email template
async function loadEmailTemplate() {
    try {
        const templatePath = path.join(__dirname, 'emailTemplate.html');
        return await fs.readFile(templatePath, 'utf8');
    } catch (error) {
        console.error('Error loading email template:', error);
        return '<p>Business Partnership Opportunity</p><p>Dear Sir/Madam, We would like to explore potential business collaboration opportunities.</p>';
    }
}

// Send a single email with attachment
async function sendEmail(email, transporter, template) {
    try {
        console.log(`Attempting to send email to: ${email}`);
        
        // Define the path to the PDF attachment
        const attachmentPath = path.join(__dirname, 'Muhamed Azmin.pdf');
        
        // Check if attachment file exists
        let attachments = [];
        try {
            await fs.access(attachmentPath);
            console.log('PDF attachment found');
            attachments = [
                {
                    filename: 'Muhamed Azmin.pdf',
                    path: attachmentPath,
                    contentType: 'application/pdf'
                }
            ];
        } catch (err) {
            console.warn('PDF attachment not found, sending email without attachment');
        }
        
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Muhamed Azmin C N - Full Stack Developer',
            html: template,
            attachments: attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    createTransporter,
    loadEmailTemplate,
    sendEmail
};