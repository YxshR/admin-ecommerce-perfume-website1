import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { processScheduledEmails } from '@/server/process-emails';

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

    // Process emails using our shared function
    const result = await processScheduledEmails();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      processed: result.processed,
      results: result.results
    });
  } catch (error) {
    console.error('[ADMIN TRIGGER] Error processing scheduled emails:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 