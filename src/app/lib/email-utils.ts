import nodemailer from 'nodemailer';

// Create a transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_PORT === '465' || true,
    auth: {
      user: process.env.EMAIL_USER || 'info@avitoluxury.in',
      pass: process.env.EMAIL_PASSWORD || '23321'
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

    const mailOptions = {
      from: `Avito Luxury Admin <${process.env.EMAIL_USER || 'info@avitoluxury.in'}>`,
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

// Send order confirmation email to admin
export const sendOrderConfirmationEmail = async (
  orderData: {
    user: {
      fullName: string;
      email: string;
      phone: string;
      alternatePhone?: string;
      address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    };
    order: {
      items: Array<{
        name: string;
        category: string;
        subCategory: string;
        volume: string;
        image: string;
        quantity: number;
        price: number;
        total: number;
      }>;
    };
    payment: {
      id: string;
      amount: number;
      method: string;
      date: string;
    };
  }
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "465"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Process order items to create HTML rows
    const itemRows = orderData.order.items.map(item => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; vertical-align: top;">
          <div style="display: flex; align-items: center;">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">
            ${item.name}
          </div>
        </td>
        <td style="padding: 10px; vertical-align: top;">${item.category}</td>
        <td style="padding: 10px; vertical-align: top;">${item.subCategory}</td>
        <td style="padding: 10px; vertical-align: top;">${item.volume}</td>
        <td style="padding: 10px; text-align: center; vertical-align: top;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right; vertical-align: top;">₹${item.price}</td>
        <td style="padding: 10px; text-align: right; vertical-align: top;">₹${item.total}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `Avito Luxury Order <${process.env.EMAIL_USER || 'info@avitoluxury.in'}>`,
      to: process.env.EMAIL_RECIPIENT || 'youngblood.yr@gmail.com',
      subject: `New Order Received - Payment Successful`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="700" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 8px; overflow: hidden; padding: 30px;">
          
          <!-- Header -->
          <tr>
            <td>
              <h2 style="margin-top: 0; color: #2c3e50;">🛒 New Order Received</h2>
              <p style="margin-bottom: 20px;">A new order has been placed and payment has been successfully received. Please find the order details below:</p>
            </td>
          </tr>

          <!-- Customer Information -->
          <tr>
            <td>
              <h3 style="color: #2980b9;">🧍‍♂️ Customer Information</h3>
              <table cellpadding="5" cellspacing="0" style="width: 100%; font-size: 14px;">
                <tr>
                  <td><strong>Name:</strong></td>
                  <td>${orderData.user.fullName}</td>
                </tr>
                <tr>
                  <td><strong>Email:</strong></td>
                  <td>${orderData.user.email}</td>
                </tr>
                <tr>
                  <td><strong>Phone:</strong></td>
                  <td>${orderData.user.phone}</td>
                </tr>
                ${orderData.user.alternatePhone ? `
                <tr>
                  <td><strong>Alternate Phone:</strong></td>
                  <td>${orderData.user.alternatePhone}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding-top: 20px;">
              <h3 style="color: #2980b9;">📦 Shipping Address</h3>
              <p style="font-size: 14px;">
                ${orderData.user.address.line1}<br />
                ${orderData.user.address.line2 ? orderData.user.address.line2 + '<br />' : ''}
                ${orderData.user.address.city}, ${orderData.user.address.state} - ${orderData.user.address.zip}<br />
                ${orderData.user.address.country}
              </p>
            </td>
          </tr>

          <!-- Product Details -->
          <tr>
            <td style="padding-top: 20px;">
              <h3 style="color: #2980b9;">🛍️ Product Details</h3>
              <table width="100%" style="border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #ecf0f1;">
                    <th style="padding: 12px; text-align: left;">Product</th>
                    <th style="padding: 12px; text-align: left;">Category</th>
                    <th style="padding: 12px; text-align: left;">Sub-Category</th>
                    <th style="padding: 12px; text-align: left;">Volume</th>
                    <th style="padding: 12px; text-align: center;">Qty</th>
                    <th style="padding: 12px; text-align: right;">Price</th>
                    <th style="padding: 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Payment Info -->
          <tr>
            <td>
              <h3 style="color: #2980b9;">💳 Payment Details</h3>
              <table cellpadding="5" cellspacing="0" style="width: 100%; font-size: 14px;">
                <tr>
                  <td><strong>Payment ID:</strong></td>
                  <td>${orderData.payment.id}</td>
                </tr>
                <tr>
                  <td><strong>Amount Paid:</strong></td>
                  <td>₹${orderData.payment.amount}</td>
                </tr>
                <tr>
                  <td><strong>Payment Method:</strong></td>
                  <td>${orderData.payment.method}</td>
                </tr>
                <tr>
                  <td><strong>Date:</strong></td>
                  <td>${orderData.payment.date}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 30px; font-size: 12px; color: #999;">
              <p>This is an automated message from your order system. Please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};
