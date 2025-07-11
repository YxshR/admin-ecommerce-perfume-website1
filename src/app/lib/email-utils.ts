import nodemailer from 'nodemailer';

// Create a transporter object using SMTP transport
const createTransporter = () => {
  // For production, use actual SMTP credentials
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'avitoluxury@gmail.com',
      pass: process.env.EMAIL_PASSWORD // This should be set in your .env file
    }
  });
};

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to admin email
export const sendAdminOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // Check if email configuration is available
    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email password not configured. Please set EMAIL_PASSWORD in .env.local');
      return false;
    }
    
    // Email content
    const mailOptions = {
      from: `"Avito Luxury Admin" <${process.env.EMAIL_USER || 'avitoluxury@gmail.com'}>`,
      to: email,
      subject: 'Admin Login OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1a202c; color: white; padding: 20px; text-align: center;">
            <h1>Avito Luxury Admin Portal</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
            <p>Hello Admin,</p>
            <p>Your one-time password (OTP) for admin login is:</p>
            <div style="background-color: #f7fafc; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This OTP is valid for 10 minutes. Please do not share this with anyone.</p>
            <p>If you did not request this OTP, please ignore this email and ensure your account is secure.</p>
            <p>Thank you,<br>Avito Luxury Team</p>
          </div>
          <div style="background-color: #f7fafc; padding: 10px; text-align: center; font-size: 12px; color: #718096;">
            &copy; ${new Date().getFullYear()} Avito Luxury. All rights reserved.
          </div>
        </div>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send contact form notification to admin
export const sendContactFormEmail = async (
  contactData: { 
    name: string; 
    email: string; 
    phone?: string; 
    subject: string; 
    message: string; 
  }
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ,
      port: parseInt(process.env.EMAIL_PORT || "465"),
      secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER ,
        pass: process.env.EMAIL_PASSWORD 
      }
    });
    
    const { name, email, phone, subject, message } = contactData;
    const currentYear = new Date().getFullYear();
    
    // Email content
    const mailOptions = {
      from: `"Avito Luxury Website" <${process.env.EMAIL_USER || "info@avitoluxury.in"}>`,
      to: process.env.EMAIL_RECIPIENT || "youngblood.yr@gmail.com",
      subject: `New Contact Form Submission: ${subject}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Luxury Contact Form Email</title>
  <style>
    body {
      font-family: 'Georgia', serif;
    }
  </style>
</head>
<body class="bg-gradient-to-br from-gray-100 to-gray-300 p-6">
  <div class="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-200 p-8">
    <!-- Logo -->
    <div class="flex justify-center mb-6">
      <img src="https://res.cloudinary.com/dzzxpyqif/image/upload/v1752250731/avitologo3_yt1lzu.png" alt="Company Logo" class="w-40">
    </div>

    <!-- Title -->
    <h2 class="text-3xl font-bold text-center text-[#1c1f36] tracking-wide mb-2">New Message Received</h2>
    <p class="text-center text-[#9b870c] text-sm mb-8 uppercase">From your website contact form</p>

    <!-- Info Block -->
    <div class="grid gap-4 text-[15px] text-gray-800">
      <div class="flex">
        <span class="w-32 font-semibold text-gray-600">Full Name:</span>
        <span>${name}</span>
      </div>
      <div class="flex">
        <span class="w-32 font-semibold text-gray-600">Email:</span>
        <span>${email}</span>
      </div>
      <div class="flex">
        <span class="w-32 font-semibold text-gray-600">Phone:</span>
        <span>${phone || 'Not provided'}</span>
      </div>
      <div class="flex">
        <span class="w-32 font-semibold text-gray-600">Subject:</span>
        <span>${subject}</span>
      </div>
    </div>

    <!-- Message -->
    <div class="mt-8 border-l-4 border-[#9b870c] bg-[#fdfaf3] p-5 rounded-md shadow-sm">
      <p class="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
        ${message}
      </p>
    </div>

    <!-- Footer -->
    <div class="text-xs text-center text-gray-500 mt-10">
      &copy; ${currentYear} Avito Luxury. All rights reserved.
    </div>
  </div>
</body>
</html>`
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact form email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return false;
  }
}; 