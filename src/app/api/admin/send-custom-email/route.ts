import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectMongoDB from '@/app/lib/mongodb';
import Subscriber from '@/app/models/Subscriber';
import nodemailer from 'nodemailer';
import { sendCustomEmail } from '@/app/lib/email-utils';
import ScheduledEmail from '@/app/models/ScheduledEmail';

// Create a transporter object using SMTP transport
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

// Helper function to ensure recipients are properly processed
function processRecipients(recipients: any): string[] {
  if (!recipients) return [];
  
  // If already an array, filter out any empty strings
  if (Array.isArray(recipients)) {
    return recipients.filter(email => typeof email === 'string' && email.trim() !== '');
  }
  
  // If it's a string, split by commas
  if (typeof recipients === 'string') {
    return recipients.split(',').map(email => email.trim()).filter(email => email !== '');
  }
  
  // If it's an object but not an array, try to extract values
  if (typeof recipients === 'object') {
    const values = Object.values(recipients);
    if (values.length > 0) {
      return values
        .filter(val => val && typeof val === 'string' && val.trim() !== '')
        .map(val => val.trim());
    }
  }
  
  return [];
}

// POST handler to send custom emails to subscribers
export async function POST(request: NextRequest) {
  try {
    // Authentication check - FIX: Make cookies() awaitable
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get template data from request
    const data = await request.json();
    console.log("Received request data:", JSON.stringify(data, null, 2));
    
    const { 
      template, 
      sendToAll, 
      selectedSubscribers, 
      customRecipients,
      scheduleEmail,
      scheduledTime,
      attachments
    } = data;
    
    if (!template || !template.subject || !template.heading || !template.content) {
      return NextResponse.json(
        { success: false, message: 'Missing required template fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Get recipients based on selection
    let targetEmails: string[] = [];
    
    // Handle custom recipients if provided
    if (customRecipients) {
      console.log('Processing custom recipients:', customRecipients);
      const processedRecipients = processRecipients(customRecipients);
      console.log('Processed custom recipients:', processedRecipients);
      
      if (processedRecipients.length > 0) {
        targetEmails = processedRecipients;
      } else {
        console.log('No valid custom recipients found after processing');
      }
    } else {
      console.log('No custom recipients provided');
    }
    
    // If no custom recipients, use subscribers
    if (targetEmails.length === 0) {
      console.log('Using subscribers instead');
      // Get subscribers based on selection
      let targetSubscribers = [];
      
      if (sendToAll) {
        // Get all active subscribers
        targetSubscribers = await Subscriber.find({ isActive: true });
        console.log(`Found ${targetSubscribers.length} active subscribers`);
      } else if (selectedSubscribers && selectedSubscribers.length > 0) {
        // Get only selected subscribers that are active
        targetSubscribers = await Subscriber.find({ 
          email: { $in: selectedSubscribers },
          isActive: true 
        });
        console.log(`Found ${targetSubscribers.length} selected active subscribers`);
      }
      
      targetEmails = targetSubscribers.map(subscriber => subscriber.email);
    }
    
    console.log(`Final target emails (${targetEmails.length}):`, targetEmails);
    
    if (targetEmails.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No recipients to notify' },
        { status: 200 }
      );
    }

    // Handle email scheduling
    if (scheduleEmail && scheduledTime) {
      console.log(`Scheduling email for ${scheduledTime}`);
      // Create a scheduled email in the database
      const scheduledEmailDoc = new ScheduledEmail({
        template,
        recipients: targetEmails,
        scheduledTime: new Date(scheduledTime),
        status: 'pending',
        attachments: attachments || [] // Save attachments if provided
      });
      
      await scheduledEmailDoc.save();
      console.log(`Scheduled email saved with ID: ${scheduledEmailDoc._id}`);
      
      // Immediately trigger the email processor if the scheduled time is very close or in the past
      try {
        const scheduledDate = new Date(scheduledTime);
        const now = new Date();
        const diffSeconds = (scheduledDate.getTime() - now.getTime()) / 1000;
        
        // If scheduled for the next 60 seconds or in the past, trigger processing immediately
        if (diffSeconds <= 60) {
          console.log(`Scheduled time is within 60 seconds, triggering email processor immediately`);
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/cron/process-scheduled-emails`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.CRON_SECRET || 'development-secret'}`
            },
            cache: 'no-store'
          });
        }
      } catch (triggerError) {
        console.error('Error triggering email processor after scheduling:', triggerError);
        // Don't fail the request if the trigger fails
      }
      
      return NextResponse.json(
        { 
          success: true, 
          message: `Email scheduled for ${new Date(scheduledTime).toLocaleString()} to ${targetEmails.length} recipients`
        },
        { status: 200 }
      );
    }

    // If not scheduled, send immediately
    if (!process.env.EMAIL_PASSWORD) {
      console.error('Email password not configured. Please set EMAIL_PASSWORD in .env.local');
      return NextResponse.json(
        { success: false, message: 'Email configuration error' },
        { status: 500 }
      );
    }

    console.log('Sending email immediately');
    // Send emails to target recipients with attachments if provided
    const result = await sendCustomEmail(targetEmails, template, attachments);
    console.log('Send result:', result);
    
    return NextResponse.json(
      { 
        success: result.success, 
        message: `Campaign sent to ${result.sentCount} recipients${targetEmails.length - result.sentCount > 0 ? `, ${targetEmails.length - result.sentCount} failed` : ''}` 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending custom emails:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send custom emails' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 