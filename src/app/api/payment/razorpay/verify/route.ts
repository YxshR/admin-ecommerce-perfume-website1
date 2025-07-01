import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/app/lib/db-connect';
import Order from '@/app/models/Order';

// Razorpay webhook verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    console.log("Verifying payment:", { 
      razorpay_order_id, 
      razorpay_payment_id, 
      orderId,
      has_signature: !!razorpay_signature 
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing required parameters");
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET 
    
    console.log("Using key secret for verification:", {
      from_env: !!process.env.RAZORPAY_KEY_SECRET,
      using_fallback: !process.env.RAZORPAY_KEY_SECRET
    });
    
    if (!secret) {
      console.error("Razorpay key secret is not configured");
      return NextResponse.json(
        { success: false, error: 'Payment verification configuration error' },
        { status: 500 }
      );
    }
    
    console.log("Generating signature using text:", text);

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');
      
    const isAuthentic = generatedSignature === razorpay_signature;

    console.log("Signature verification:", { 
      isAuthentic,
      generatedSignature: generatedSignature.substring(0, 10) + '...',
      providedSignature: razorpay_signature.substring(0, 10) + '...',
    });

    if (!isAuthentic) {
      console.error("Invalid signature");
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    
    // Find and update order
    if (orderId) {
      console.log("Finding order:", orderId);
      
      const order = await Order.findById(orderId);
      
      if (!order) {
        console.error("Order not found:", orderId);
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      
      console.log("Updating order payment status");
      
      // Update payment information
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'Processing';
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'Completed',
        update_time: new Date().toISOString(),
        razorpay_order_id,
      };
      
      await order.save();
      
      console.log("Order updated successfully");
      
      return NextResponse.json({
        success: true,
        order: {
          id: order._id,
          isPaid: order.isPaid,
          status: order.status
        }
      });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Payment verification error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment verification failed',
        details: error.message
      },
      { status: 500 }
    );
  }
} 