import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import Subscriber from '@/app/models/Subscriber';
import { sendProductNotificationEmail } from '@/app/lib/email-utils';

// POST handler to notify subscribers about a new product
export async function POST(request: NextRequest) {
  try {
    // Get product data from request
    const productData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'subCategory', 'volume', 'image', 'slug'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Get all active subscribers
    const activeSubscribers = await Subscriber.find({ isActive: true });
    
    if (activeSubscribers.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No active subscribers to notify' },
        { status: 200 }
      );
    }

    // Send emails to all active subscribers
    const emailPromises = activeSubscribers.map(subscriber => 
      sendProductNotificationEmail(subscriber.email, productData)
    );

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    
    // Count successful and failed emails
    const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failed = activeSubscribers.length - successful;

    return NextResponse.json(
      { 
        success: true, 
        message: `Notifications sent to ${successful} subscribers${failed > 0 ? `, ${failed} failed` : ''}` 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error notifying subscribers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to notify subscribers' },
      { status: 500 }
    );
  }
} 