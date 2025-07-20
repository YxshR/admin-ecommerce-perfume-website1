import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import ScheduledEmail from '@/app/models/ScheduledEmail';
import { sendCustomEmail } from '@/app/lib/email-utils';

// This endpoint processes scheduled emails
// It can be called by a cron job or manually triggered
export async function GET(request: NextRequest) {
  try {
    // Get current time
    const now = new Date();
    const timestamp = now.toISOString();
    console.log(`[EMAIL PROCESSOR ${timestamp}] Processing scheduled emails`);
    
    // Verify authorization for non-development environments
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development-secret';
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      console.log('[EMAIL PROCESSOR] Unauthorized access attempt');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    try {
      await connectMongoDB();
    } catch (dbError) {
      console.error('[EMAIL PROCESSOR] Database connection error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database connection failed. Please check your MongoDB connection settings.',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }
    
    // Find all emails that should be sent (scheduled time is in the past)
    const pendingEmails = await ScheduledEmail.find({
      scheduledTime: { $lte: now },
      status: 'pending'
    }).sort({ scheduledTime: 1 }).lean(); // Process oldest first
    
    console.log(`[EMAIL PROCESSOR] Found ${pendingEmails.length} pending emails to process`);
    
    if (pendingEmails.length === 0) {
      console.log('[EMAIL PROCESSOR] No emails to process at this time');
      return NextResponse.json(
        { success: true, message: 'No scheduled emails to process' },
        { status: 200 }
      );
    }
    
    // Process each scheduled email
    const results = [];
    
    for (const email of pendingEmails) {
      try {
        // First, update the status to 'processing' to prevent duplicate processing
        await ScheduledEmail.findByIdAndUpdate(email._id, { status: 'processing' });
        
        console.log(`[EMAIL PROCESSOR] Processing email ${email._id} scheduled for ${new Date(email.scheduledTime).toISOString()}`);
        console.log(`[EMAIL PROCESSOR] Email subject: "${email.template.subject}"`);
        console.log(`[EMAIL PROCESSOR] Recipients: ${email.recipients.length}`);
        
        // Send the email
        const result = await sendCustomEmail(email.recipients, email.template, email.attachments);
        
        // Update the scheduled email status
        const status = result.success ? 'sent' : 'failed';
        await ScheduledEmail.findByIdAndUpdate(email._id, {
          status: status,
          sentAt: now
        });
        
        console.log(`[EMAIL PROCESSOR] Email ${email._id} processed with status: ${status}, sent to ${result.sentCount} recipients`);
        
        results.push({
          id: email._id,
          subject: email.template.subject,
          recipients: email.recipients.length,
          sent: result.sentCount,
          status: status
        });
      } catch (error) {
        console.error(`[EMAIL PROCESSOR] Error processing scheduled email ${email._id}:`, error);
        
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
    
    console.log(`[EMAIL PROCESSOR] Completed processing ${pendingEmails.length} scheduled emails`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: `Processed ${pendingEmails.length} scheduled emails`,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[EMAIL PROCESSOR] Error processing scheduled emails:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process scheduled emails',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 