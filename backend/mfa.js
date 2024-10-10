const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate MFA token
function generateMFAToken() {
  return crypto.randomBytes(3).toString('hex'); // Generates a 6-digit token
}

// Verify MFA token
function verifyMFAToken(token, storedToken) {
  return token === storedToken;
}

// Send MFA token via email
async function sendMFAEmail(email, mfaToken) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Loads the email from the .env file
      pass: process.env.EMAIL_PASS, // Loads the app-specific password from the .env file
    },
  });

  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Pass:', process.env.EMAIL_PASS);

  let mailOptions = {
    from: 'farzadsnjau@gmail.com',
    to: email,
    subject: 'Your MFA Verification Code',
    text: `Your MFA token is: ${mfaToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('MFA email sent successfully');
  } catch (error) {
    console.error('Error sending MFA email:', error);
  }
}

module.exports = {
  generateMFAToken,
  verifyMFAToken,
  sendMFAEmail,
};
