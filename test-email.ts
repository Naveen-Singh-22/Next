const { sendOtpEmail } = require('./src/lib/emailService');
require('dotenv').config();

async function testEmail() {
  console.log('Starting email test...');
  console.log('Config:', {
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT,
    user: process.env.EMAIL_SMTP_USER,
    from: process.env.EMAIL_FROM
  });

  try {
    const result = await sendOtpEmail(process.env.EMAIL_SMTP_USER, '1234');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testEmail();
