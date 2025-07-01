import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import Order from '@/app/models/Order';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    
    // Find order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Validate Razorpay keys
    const key_id = process.env.RAZORPAY_KEY_ID;
    if (!key_id) {
      return NextResponse.json(
        { success: false, error: 'Razorpay is not configured' },
        { status: 500 }
      );
    }

    // Return order details and key for client-side integration
    return NextResponse.json({
      success: true,
      key_id,
      order: {
        id: order._id.toString(),
        totalAmount: order.totalPrice * 100, // Convert to paise for Razorpay
        currency: 'INR',
        notes: {
          orderId: order._id.toString()
        }
      },
      user: {
        name: order.shippingAddress.fullName,
        email: order.user?.email || '',
        contact: order.shippingAddress.phone
      }
    });
    
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
} 