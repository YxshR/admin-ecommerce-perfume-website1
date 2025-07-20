import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectMongoDB from '@/app/lib/mongodb';
import ScheduledEmail from '@/app/models/ScheduledEmail';

// GET handler to fetch a specific scheduled email
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check - using cookies() directly
    const adminToken = cookies().get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find the scheduled email
    const scheduledEmail = await ScheduledEmail.findById(id);
    
    if (!scheduledEmail) {
      return NextResponse.json(
        { success: false, message: 'Scheduled email not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, scheduledEmail },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching scheduled email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch scheduled email' },
      { status: 500 }
    );
  }
}

// PUT handler to fully update a scheduled email
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check - using cookies() directly
    const adminToken = cookies().get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find the scheduled email
    const scheduledEmail = await ScheduledEmail.findById(id);
    
    if (!scheduledEmail) {
      return NextResponse.json(
        { success: false, message: 'Scheduled email not found' },
        { status: 404 }
      );
    }
    
    // Only allow updates to pending emails
    if (scheduledEmail.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Only pending emails can be updated' },
        { status: 400 }
      );
    }
    
    // Get the update data from the request
    const data = await request.json();
    
    // Validate required fields
    if (!data.template?.subject || !data.template?.heading || !data.template?.content) {
      return NextResponse.json(
        { success: false, message: 'Missing required template fields' },
        { status: 400 }
      );
    }
    
    // Validate scheduledTime if provided
    if (data.scheduledTime) {
      const scheduledTime = new Date(data.scheduledTime);
      
      // Ensure the scheduled time is in the future
      if (scheduledTime <= new Date()) {
        return NextResponse.json(
          { success: false, message: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }
      
      // Update the scheduled time
      scheduledEmail.scheduledTime = scheduledTime;
    }
    
    // Update the template
    if (data.template) {
      scheduledEmail.template = {
        ...scheduledEmail.template,
        ...data.template
      };
    }
    
    // Save the updated email
    await scheduledEmail.save();
    
    // Trigger the cron job if the scheduled time is within 5 minutes
    try {
      const scheduledDate = new Date(scheduledEmail.scheduledTime);
      const now = new Date();
      const diffMinutes = (scheduledDate.getTime() - now.getTime()) / (1000 * 60);
      
      if (diffMinutes <= 5) {
        console.log(`Updated scheduled time is within 5 minutes, triggering cron job immediately`);
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/cron/process-scheduled-emails`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
          },
          cache: 'no-store'
        });
      }
    } catch (triggerError) {
      console.error('Error triggering cron job after updating email:', triggerError);
      // Don't fail the request if the trigger fails
    }
    
    return NextResponse.json(
      { success: true, message: 'Scheduled email updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating scheduled email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update scheduled email' },
      { status: 500 }
    );
  }
}

// PATCH handler to update a scheduled email (e.g., reschedule)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check - using cookies() directly
    const adminToken = cookies().get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find the scheduled email
    const scheduledEmail = await ScheduledEmail.findById(id);
    
    if (!scheduledEmail) {
      return NextResponse.json(
        { success: false, message: 'Scheduled email not found' },
        { status: 404 }
      );
    }
    
    // Only allow updates to pending emails
    if (scheduledEmail.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Only pending emails can be updated' },
        { status: 400 }
      );
    }
    
    // Get the update data from the request
    const data = await request.json();
    
    // Validate scheduledTime if provided
    if (data.scheduledTime) {
      const scheduledTime = new Date(data.scheduledTime);
      
      // Ensure the scheduled time is in the future
      if (scheduledTime <= new Date()) {
        return NextResponse.json(
          { success: false, message: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }
      
      // Update the scheduled time
      scheduledEmail.scheduledTime = scheduledTime;
    }
    
    // Save the updated email
    await scheduledEmail.save();
    
    // Trigger the cron job if the scheduled time is within 5 minutes
    try {
      const scheduledDate = new Date(scheduledEmail.scheduledTime);
      const now = new Date();
      const diffMinutes = (scheduledDate.getTime() - now.getTime()) / (1000 * 60);
      
      if (diffMinutes <= 5) {
        console.log(`Updated scheduled time is within 5 minutes, triggering cron job immediately`);
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/cron/process-scheduled-emails`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
          },
          cache: 'no-store'
        });
      }
    } catch (triggerError) {
      console.error('Error triggering cron job after rescheduling:', triggerError);
      // Don't fail the request if the trigger fails
    }
    
    return NextResponse.json(
      { success: true, message: 'Scheduled email updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating scheduled email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update scheduled email' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a scheduled email
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check - using cookies() directly
    const adminToken = cookies().get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find the scheduled email
    const scheduledEmail = await ScheduledEmail.findById(id);
    
    if (!scheduledEmail) {
      return NextResponse.json(
        { success: false, message: 'Scheduled email not found' },
        { status: 404 }
      );
    }
    
    // Only allow deletion of pending emails
    if (scheduledEmail.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Only pending emails can be deleted' },
        { status: 400 }
      );
    }
    
    // Delete the scheduled email
    await ScheduledEmail.findByIdAndDelete(id);
    
    return NextResponse.json(
      { success: true, message: 'Scheduled email deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting scheduled email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete scheduled email' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 