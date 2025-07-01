import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import Order from '@/app/models/Order';
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';

// Function to load .env.local directly
function loadRazorpayEnvVars() {
  const envPath = path.join(process.cwd(), '.env.local');
  let key_id = '';
  let key_secret = '';
  
  try {
    if (fs.existsSync(envPath)) {
      console.log('Loading Razorpay keys from .env.local');
      const envFile = fs.readFileSync(envPath, 'utf8');
      
      // Parse file lines
      envFile.split('\n').forEach(line => {
        if (line.startsWith('RAZORPAY_KEY_ID=')) {
          key_id = line.substring('RAZORPAY_KEY_ID='.length).trim();
        } else if (line.startsWith('RAZORPAY_KEY_SECRET=')) {
          key_secret = line.substring('RAZORPAY_KEY_SECRET='.length).trim();
        }
      });
    }
  } catch (error) {
    console.error('Error loading .env.local file:', error);
  }
  
  return { key_id, key_secret };
}

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

    console.log("Creating Razorpay order for orderId:", orderId);

    // Connect to database
    await connectToDatabase();
    
    // Find order
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error("Order not found:", orderId);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Get environment variables
    let key_id = process.env.RAZORPAY_KEY_ID;
    let key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    // If environment variables are not set, try loading directly from file
    if (!key_id || !key_secret) {
      console.log("Environment variables not found, loading from file");
      const envVars = loadRazorpayEnvVars();
      key_id = envVars.key_id 
      key_secret = envVars.key_secret 
    }
    
    console.log("Razorpay credentials:", {
      key_id_exists: !!key_id,
      key_secret_exists: !!key_secret
    });
    
    // Use hardcoded values if still not available
    key_id = key_id 
    key_secret = key_secret 
    
    if (!key_id || !key_secret) {
      console.error("Razorpay keys missing");
      return NextResponse.json(
        { success: false, error: 'Razorpay is not configured' },
        { status: 500 }
      );
    }

    console.log("Using Razorpay key:", key_id);
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });
    
    // Calculate amount in paise
    const amountInPaise = Math.round(order.totalPrice * 100);
    
    // Ensure amount is at least 100 paise (1 rupee)
    const finalAmount = Math.max(amountInPaise, 100);
    
    console.log("Creating Razorpay order with amount:", finalAmount, "paise");
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmount,
      currency: 'INR',
      receipt: orderId,
      notes: {
        orderId: orderId
      }
    });
    
    console.log("Razorpay order created:", razorpayOrder.id);
    
    // Update order with Razorpay order ID
    order.paymentResult = {
      ...order.paymentResult || {},
      razorpay_order_id: razorpayOrder.id
    };
    
    await order.save();
    
    // Return Razorpay order details
    return NextResponse.json({
      success: true,
      key_id,
      order: {
        id: razorpayOrder.id,
        totalAmount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        notes: razorpayOrder.notes
      },
      user: {
        name: order.shippingAddress.fullName,
        email: order.user?.email || '',
        contact: order.shippingAddress.phone
      }
    });
    
  } catch (error: any) {
    console.error('Razorpay order creation error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment order',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 