import connectMongoDB from '@/app/lib/mongodb';
import ScheduledEmail from '@/app/models/ScheduledEmail';
import { sendCustomEmail } from '@/app/lib/email-utils';

/**
 * Process scheduled emails
 * This function is called by the cron job
 */
export async function processScheduledEmails() {
  // Get current time in Indian timezone (IST = UTC+5:30)
  const now = new Date();
  // Adjust to Indian Standard Time (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istNow = new Date(now.getTime() + istOffset);
  
  const timestamp = istNow.toISOString();
  console.log(`[CRON ${timestamp}] Processing scheduled emails (Indian Time)`);
  
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Calculate the time window: 1 minute in the past to 1 minute in the future
    // Since we're running every 30 seconds, this ensures we don't miss any emails
    const pastWindow = new Date(now.getTime() - 60 * 1000); // 1 minute ago
    const futureWindow = new Date(now.getTime() + 60 * 1000); // 1 minute in the future
    
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
      return {
        success: true,
        message: 'No scheduled emails to process',
        processed: 0
      };
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
    
    return {
      success: true,
      message: `Processed ${emailsToProcess.length} scheduled emails`,
      processed: emailsToProcess.length,
      results
    };
  } catch (error) {
    console.error('[CRON] Error processing scheduled emails:', error);
    return {
      success: false,
      message: 'Failed to process scheduled emails',
      processed: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 