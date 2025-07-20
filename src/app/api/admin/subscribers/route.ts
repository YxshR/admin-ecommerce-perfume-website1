import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectMongoDB from '@/app/lib/mongodb';
import Subscriber from '@/app/models/Subscriber';

// GET all subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Get all subscribers, sorted by most recent first
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });

    return NextResponse.json(
      { success: true, subscribers },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 