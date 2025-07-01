import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the CSP violation report
    const report = await request.json();
    
    // In production, you would log this to a secure logging service
    // For security reasons, we don't log to console
    
    // You could store these reports in your database for later analysis
    // Or send them to a monitoring service
    
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    // Silent error handling for security
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 