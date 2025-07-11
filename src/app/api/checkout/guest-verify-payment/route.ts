import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import GuestOrder from '@/app/models/GuestOrder';
import Product from '@/app/models/Product';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from '@/app/lib/email-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = body;
    
    // Validate input
    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find guest order and populate product information
    const order = await GuestOrder.findById(orderId).populate({
      path: 'items.product',
      model: Product
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Verify signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_secret) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }
    
    // Generate signature
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    
    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
    
    // Update order
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'Processing';
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'completed',
      update_time: new Date().toISOString(),
      email_address: order.customerInfo.email
    };
    
    await order.save();
    
    // Send order confirmation email
    try {
      const formattedDate = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata'
      });

      // Format order data for email with enhanced product details
      const emailData = {
        user: {
          fullName: order.customerInfo.name,
          email: order.customerInfo.email,
          phone: order.customerInfo.phone,
          address: {
            line1: order.shippingAddress.addressLine1,
            line2: order.shippingAddress.addressLine2 || '',
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            zip: order.shippingAddress.pincode,
            country: order.shippingAddress.country
          }
        },
        order: {
          items: order.items.map(item => {
            // Get product details if available
            const productDetails = item.product ? {
              category: item.product.category || 'N/A',
              subCategory: item.product.subCategories && item.product.subCategories.length > 0 
                ? item.product.subCategories[0] 
                : 'N/A',
              volume: item.product.volume || 'N/A',
              image: item.product.mainImage || item.image || '/placeholder-product.jpg'
            } : {
              category: 'N/A',
              subCategory: 'N/A',
              volume: 'N/A',
              image: item.image || '/placeholder-product.jpg'
            };
            
            return {
              name: item.name,
              category: productDetails.category,
              subCategory: productDetails.subCategory,
              volume: productDetails.volume,
              image: productDetails.image,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity
            };
          })
        },
        payment: {
          id: razorpay_payment_id,
          amount: order.totalPrice,
          method: order.paymentMethod,
          date: formattedDate
        }
      };

      await sendOrderConfirmationEmail(emailData);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the request if email sending fails
    }
    
    return NextResponse.json({
      success: true,
      trackingId: order.trackingNumber
    });
    
  } catch (error) {
    console.error('Error verifying guest payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 