import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectMongoDB from '@/app/lib/mongodb';
import ScheduledEmail from '@/app/models/ScheduledEmail';
import { sendCustomEmail } from '@/app/lib/email-utils';

// POST handler to manually trigger processing of scheduled emails
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

    // Get the ID of the scheduled email to process (if provided)
    let emailId;
    try {
      const body = await request.json();
      emailId = body.emailId;
    } catch (error) {
      // No body or invalid JSON, will process all pending emails
    }

    // Connect to MongoDB
    await connectMongoDB();
    
    // Find scheduled emails to process
    let query = { status: 'pending' };
    
    // If an ID was provided, only process that specific email
    if (emailId) {
      query = { ...query, _id: emailId };
    }
    
    const scheduledEmails = await ScheduledEmail.find(query);
    
    if (scheduledEmails.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No scheduled emails to process' },
        { status: 200 }
      );
    }
    
    // Process each scheduled email
    const results = [];
    
    for (const email of scheduledEmails) {
      try {
        console.log(`Manually processing email ${email._id}`);
        
        // Send the email
        const result = await sendCustomEmail(email.recipients, email.template);
        
        // Update the scheduled email status
        email.status = result.success ? 'sent' : 'failed';
        email.sentAt = new Date();
        await email.save();
        
        results.push({
          id: email._id,
          subject: email.template.subject,
          recipients: email.recipients.length,
          sent: result.sentCount,
          status: email.status
        });
      } catch (error) {
        console.error(`Error processing scheduled email ${email._id}:`, error);
        
        // Update status to failed
        email.status = 'failed';
        await email.save();
        
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
    
    return NextResponse.json(
      { 
        success: true, 
        message: `Manually processed ${scheduledEmails.length} scheduled emails`,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 