import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST handler to manually trigger the cron job for testing
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

    // Call the cron job endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/cron/process-scheduled-emails`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to trigger cron job');
    }
    
    const result = await response.json();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Cron job triggered successfully',
        result
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error triggering cron job:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to trigger cron job' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 