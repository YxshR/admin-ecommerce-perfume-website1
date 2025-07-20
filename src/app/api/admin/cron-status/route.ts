import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCronJobsStatus } from '@/server/cron-service';

// GET handler to check cron job status
export async function GET(request: NextRequest) {
  try {
    // Authentication check - using cookies() directly
    const adminToken = cookies().get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get cron job status
    const cronJobs = getCronJobsStatus();
    
    return NextResponse.json({
      success: true,
      message: 'Cron job status retrieved',
      cronJobs,
      serverTime: new Date().toISOString(),
      // Calculate IST time
      istTime: new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error getting cron job status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get cron job status' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 