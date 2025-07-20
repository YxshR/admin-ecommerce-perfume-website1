import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectMongoDB from '@/app/lib/mongodb';
import ScheduledEmail from '@/app/models/ScheduledEmail';

// GET handler to fetch all scheduled emails
export async function GET(request: NextRequest) {
  try {
    // Authentication check - Fix cookies API by using it as a function
    const adminToken = cookies().get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();
    
    // Get all scheduled emails, sorted by scheduledTime (newest first)
    const scheduledEmails = await ScheduledEmail.find({})
      .sort({ scheduledTime: -1 })
      .lean();
    
    return NextResponse.json(
      { success: true, scheduledEmails },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching scheduled emails:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch scheduled emails' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 