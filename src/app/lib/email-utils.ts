import nodemailer from 'nodemailer';

// Create a transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER || 'avitoluxury@gmail.com',
      pass: process.env.EMAIL_PASSWORD
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

    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email password not configured. Please set EMAIL_PASSWORD in .env.local');
      return false;
    }

    const mailOptions = {
      from: `Avito Luxury Admin <${process.env.EMAIL_USER || 'avitoluxury@gmail.com'}>`,
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
    const transporter = require('nodemailer').createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "465"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const { name, email, phone, subject, message } = contactData;
    const currentYear = new Date().getFullYear();
    const dateTime = new Date().toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });

    const mailOptions = {
      from: `Avito Luxury Website <${process.env.EMAIL_USER || 'info@avitoluxury.in'}>`,
      to: process.env.EMAIL_RECIPIENT || 'youngblood.yr@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
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
        <body style="background: linear-gradient(to bottom right, #f3f4f6, #d1d5db); padding: 24px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px;">

            <!-- Title -->
            <h2 style="font-size: 28px; font-weight: bold; text-align: center; color: #1c1f36; letter-spacing: 0.5px; margin-bottom: 8px;">New Message Received</h2>
            <p style="text-align: center; color: #9b870c; font-size: 13px; margin-bottom: 32px; text-transform: uppercase;">From your website contact form</p>

            <!-- Info Block -->
            <div style="font-size: 15px; color: #1f2937; line-height: 1.6;">
              <div style="margin-bottom: 8px;"><strong style="width: 120px; display: inline-block; color: #4b5563;">Full Name:</strong> ${name}</div>
              <div style="margin-bottom: 8px;"><strong style="width: 120px; display: inline-block; color: #4b5563;">Email:</strong> <a href="mailto:${email}" style="color: #0056b3; text-decoration: none;">${email}</a></div>
              <div style="margin-bottom: 8px;"><strong style="width: 120px; display: inline-block; color: #4b5563;">Phone:</strong> ${phone || 'Not provided'}</div>
              <div><strong style="width: 120px; display: inline-block; color: #4b5563;">Subject:</strong> ${subject}</div>
            </div>

            <!-- Message Section -->

<div style="margin-top: 32px;">
  <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 6px;">Message:</div>
  <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
    <tr>
      <td style="
        background-color: #f9f9f9;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 12px;
        font-size: 15px;
        color: #111827;
        line-height: 1.6;
        white-space: pre-line;
        word-break: break-word;
      ">
        ${message}
      </td>
    </tr>
  </table>
</div>

             <!-- Footer with Logo -->
    <table width="100%" style="margin-top: 40px; font-size: 11px; color: #9ca3af;">
      <tr>
        <td style="text-align: left;">${dateTime}</td>
        <td style="text-align: right;">
          <img src="https://res.cloudinary.com/dzzxpyqif/image/upload/v1752250731/avitologo3_yt1lzu.png"
               alt="Avito Logo"
               style="width: 200px; height: auto; opacity: 0.9;" />
        </td>
      </tr>
    </table>

    <!-- Copyright -->
    <div style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 20px;">
      &copy; ${currentYear} Avito Luxury. All rights reserved.
    </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact form email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return false;
  }
};
