import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import ScheduledEmail from '@/app/models/ScheduledEmail';
import { sendCustomEmail } from '@/app/lib/email-utils';

// This endpoint is called by a cron job every minute
// The cron job is configured in vercel.json
export async function GET(request: NextRequest) {
  // Get current time in Indian timezone (IST = UTC+5:30)
  const now = new Date();
  // Adjust to Indian Standard Time (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istNow = new Date(now.getTime() + istOffset);
  
  const timestamp = istNow.toISOString();
  console.log(`[CRON ${timestamp}] Processing scheduled emails (Indian Time)`);
  
  try {
    // Verify cron secret to ensure only authorized calls are processed
    // For testing purposes, we'll allow access without the secret if in development mode
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      console.log('[CRON] Unauthorized access attempt');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();
    
    // Calculate the time window: 2 minutes in the past to 2 minutes in the future
    // This wider window ensures we don't miss emails due to cron timing issues
    const pastWindow = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
    const futureWindow = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes in the future
    
    console.log(`[CRON ${timestamp}] Looking for emails scheduled between ${pastWindow.toISOString()} and ${futureWindow.toISOString()}`);
    console.log(`[CRON ${timestamp}] Current server time: ${now.toISOString()}`);
    console.log(`[CRON ${timestamp}] Current IST time: ${istNow.toISOString()}`);
    
    // Find scheduled emails that are due to be sent (scheduled time is within our window)
    const scheduledEmails = await ScheduledEmail.find({
      scheduledTime: { 
        $gte: pastWindow,
        $lte: futureWindow 
      },
      status: 'pending'
    }).lean();
    
    console.log(`[CRON ${timestamp}] Found ${scheduledEmails.length} scheduled emails to process in the time window`);
    
    // Also check for any missed emails (scheduled in the past but still pending)
    const missedEmails = await ScheduledEmail.find({
      scheduledTime: { $lt: pastWindow },
      status: 'pending'
    }).sort({ scheduledTime: 1 }).lean(); // Process oldest first
    
    console.log(`[CRON ${timestamp}] Found ${missedEmails.length} missed emails from the past`);
    
    // Combine missed emails and scheduled emails, with missed emails first
    const emailsToProcess = [...missedEmails, ...scheduledEmails];
    
    if (emailsToProcess.length === 0) {
      console.log(`[CRON ${timestamp}] No emails to process at this time`);
      return NextResponse.json(
        { success: true, message: 'No scheduled emails to process' },
        { status: 200 }
      );
    }
    
    // Process each scheduled email
    const results = [];
    
    for (const email of emailsToProcess) {
      try {
        // First, update the status to 'processing' to prevent duplicate processing
        await ScheduledEmail.findByIdAndUpdate(email._id, { status: 'processing' });
        
        const scheduledTimeIST = new Date(new Date(email.scheduledTime).getTime() + istOffset);
        console.log(`[CRON ${timestamp}] Processing email ${email._id} scheduled for ${scheduledTimeIST.toISOString()} (Indian Time)`);
        console.log(`[CRON ${timestamp}] Email subject: "${email.template.subject}"`);
        console.log(`[CRON ${timestamp}] Recipients: ${email.recipients.length}`);
        
        // Send the email
        const result = await sendCustomEmail(email.recipients, email.template, email.attachments);
        
        // Update the scheduled email status
        const status = result.success ? 'sent' : 'failed';
        await ScheduledEmail.findByIdAndUpdate(email._id, {
          status: status,
          sentAt: now
        });
        
        console.log(`[CRON ${timestamp}] Email ${email._id} processed with status: ${status}, sent to ${result.sentCount} recipients`);
        
        results.push({
          id: email._id,
          subject: email.template.subject,
          recipients: email.recipients.length,
          sent: result.sentCount,
          status: status
        });
      } catch (error) {
        console.error(`[CRON ${timestamp}] Error processing scheduled email ${email._id}:`, error);
        
        // Update status to failed
        await ScheduledEmail.findByIdAndUpdate(email._id, {
          status: 'failed',
          sentAt: now
        });
        
        results.push({
          id: email._id,
          subject: email.template.subject,
          recipients: email.recipients.length,
          sent: 0,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`[CRON ${timestamp}] Completed processing ${emailsToProcess.length} scheduled emails`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: `Processed ${emailsToProcess.length} scheduled emails`,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CRON] Error processing scheduled emails:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}

// Ensure this endpoint is always freshly evaluated
export const dynamic = 'force-dynamic';
// Don't cache this endpoint
export const fetchCache = 'force-no-store';
// Revalidate this endpoint immediately
export const revalidate = 0; 