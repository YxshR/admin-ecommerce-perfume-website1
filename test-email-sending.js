// Test script for email sending functionality
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

// Create a test transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER || 'info@avitoluxury.in',
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Test sending emails to multiple recipients
const testSendEmails = async () => {
  console.log('=== TEST EMAIL SENDING ===');
  
  // Test recipients
  const recipients = [
    'test1@example.com',
    'test2@example.com',
    'test3@example.com'
  ];
  
  console.log(`Recipients (${recipients.length}):`, recipients);
  
  // Create email template
  const template = {
    subject: 'Test Email',
    heading: 'Test Email Heading',
    content: 'This is a test email to verify multiple recipient functionality.',
    imageUrl: '',
    buttonText: 'Click Me',
    buttonLink: 'https://example.com'
  };
  
  // Create email HTML
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${template.subject}</title>
    </head>
    <body>
      <h1>${template.heading}</h1>
      <p>${template.content}</p>
      <a href="${template.buttonLink}">${template.buttonText}</a>
    </body>
    </html>
  `;
  
  try {
    const transporter = createTransporter();
    
    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email password not configured in .env.local');
      return;
    }
    
    let sentCount = 0;
    const failedRecipients = [];
    
    // Send to each recipient individually
    console.log(`Will now attempt to send ${recipients.length} individual emails`);
    
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      console.log(`Processing recipient ${i+1}/${recipients.length}: ${recipient}`);
      
      try {
        const mailOptions = {
          from: `TEST <${process.env.EMAIL_USER || 'info@avitoluxury.in'}>`,
          to: recipient,
          subject: template.subject,
          html: emailHtml
        };
        
        console.log(`Sending email to: ${recipient}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Success! Email sent to ${recipient}:`, info.response);
        sentCount++;
      } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error);
        failedRecipients.push(recipient);
      }
      
      // Add a delay between emails
      if (i < recipients.length - 1) {
        console.log('Waiting 1 second before sending next email...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Log results
    console.log(`Campaign completed: sent to ${sentCount} recipients, failed for ${failedRecipients.length} recipients`);
    if (failedRecipients.length > 0) {
      console.log(`Failed recipients:`, failedRecipients);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the test
testSendEmails(); 