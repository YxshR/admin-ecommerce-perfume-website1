import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectMongoDB from '@/app/lib/mongodb';
import ScheduledEmail from '@/app/models/ScheduledEmail';
import { sendCustomEmail } from '@/app/lib/email-utils';

// POST handler to force process emails immediately
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const adminToken = cookies().get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();
    
    // Get current time
    const now = new Date();
    
    // Parse request body to get time range
    let timeRange: number;
    try {
      const body = await request.json();
      timeRange = body.timeRange || 5; // Default to 5 minutes
    } catch (error) {
      timeRange = 5; // Default if no body or invalid JSON
    }
    
    // Calculate the time window
    const pastWindow = new Date(now.getTime() - timeRange * 60 * 1000);
    const futureWindow = new Date(now.getTime() + timeRange * 60 * 1000);
    
    console.log(`[ADMIN TRIGGER] Looking for emails scheduled between ${pastWindow.toISOString()} and ${futureWindow.toISOString()}`);
    
    // Find scheduled emails that are due to be sent within the time window
    const scheduledEmails = await ScheduledEmail.find({
      scheduledTime: { 
        $gte: pastWindow,
        $lte: futureWindow 
      },
      status: 'pending'
    }).lean();
    
    console.log(`[ADMIN TRIGGER] Found ${scheduledEmails.length} scheduled emails to process in the time window`);
    
    // Also check for any missed emails (scheduled in the past but still pending)
    const missedEmails = await ScheduledEmail.find({
      scheduledTime: { $lt: pastWindow },
      status: 'pending'
    }).sort({ scheduledTime: 1 }).lean(); // Process oldest first
    
    console.log(`[ADMIN TRIGGER] Found ${missedEmails.length} missed emails from the past`);
    
    // Combine missed emails and scheduled emails, with missed emails first
    const emailsToProcess = [...missedEmails, ...scheduledEmails];
    
    if (emailsToProcess.length === 0) {
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
        
        console.log(`[ADMIN TRIGGER] Processing email ${email._id} scheduled for ${new Date(email.scheduledTime).toISOString()}`);
        console.log(`[ADMIN TRIGGER] Email subject: "${email.template.subject}"`);
        console.log(`[ADMIN TRIGGER] Recipients: ${email.recipients.length}`);
        
        // Send the email
        const result = await sendCustomEmail(email.recipients, email.template, email.attachments);
        
        // Update the scheduled email status
        const status = result.success ? 'sent' : 'failed';
        await ScheduledEmail.findByIdAndUpdate(email._id, {
          status: status,
          sentAt: now
        });
        
        console.log(`[ADMIN TRIGGER] Email ${email._id} processed with status: ${status}, sent to ${result.sentCount} recipients`);
        
        results.push({
          id: email._id,
          subject: email.template.subject,
          recipients: email.recipients.length,
          sent: result.sentCount,
          status: status
        });
      } catch (error) {
        console.error(`[ADMIN TRIGGER] Error processing scheduled email ${email._id}:`, error);
        
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
    
    console.log(`[ADMIN TRIGGER] Completed processing ${emailsToProcess.length} scheduled emails`);
    
    return NextResponse.json(
      { 
        success: true, 
        message: `Processed ${emailsToProcess.length} scheduled emails`,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADMIN TRIGGER] Error processing scheduled emails:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 