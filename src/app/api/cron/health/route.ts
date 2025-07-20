import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import ScheduledEmail from '@/app/models/ScheduledEmail';

// This endpoint checks the health of the cron job system
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Get current time in Indian timezone (IST = UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istNow = new Date(now.getTime() + istOffset);
    
    // Check for any pending emails
    const pendingCount = await ScheduledEmail.countDocuments({ status: 'pending' });
    
    // Check for any processing emails (shouldn't be many unless currently running)
    const processingCount = await ScheduledEmail.countDocuments({ status: 'processing' });
    
    // Check for emails sent in the last hour
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentlySentCount = await ScheduledEmail.countDocuments({ 
      status: 'sent',
      sentAt: { $gte: oneHourAgo }
    });
    
    // Check for any failed emails in the last 24 hours
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentlyFailedCount = await ScheduledEmail.countDocuments({ 
      status: 'failed',
      sentAt: { $gte: oneDayAgo }
    });
    
    // Get the most recent sent email
    const mostRecentSent = await ScheduledEmail.findOne({ 
      status: 'sent' 
    }).sort({ sentAt: -1 }).limit(1).lean();
    
    // Calculate next scheduled emails
    const upcomingEmails = await ScheduledEmail.find({
      status: 'pending',
      scheduledTime: { $gt: now }
    }).sort({ scheduledTime: 1 }).limit(5).lean();
    
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      istTimestamp: istNow.toISOString(),
      stats: {
        pendingCount,
        processingCount,
        recentlySentCount,
        recentlyFailedCount,
        mostRecentSentAt: mostRecentSent?.sentAt || null,
        upcomingEmailsCount: upcomingEmails.length,
        nextScheduledAt: upcomingEmails.length > 0 ? upcomingEmails[0].scheduledTime : null
      }
    });
  } catch (error) {
    console.error('Error checking cron health:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check cron health' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 