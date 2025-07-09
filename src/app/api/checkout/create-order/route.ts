import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import { v4 as uuidv4 } from 'uuid';
import User from '@/app/models/User';
import Order from '@/app/models/Order';
import Product from '@/app/models/Product';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userData, cartItems, subtotal, shippingCost, totalAmount } = body;
    
    // Validate input
    if (!userData || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order data' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if user exists or create new user
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      // Create new user
      user = new User({
        name: userData.fullName,
        email: userData.email,
        password: userData.password || 'defaultPassword123', // Provide a default password if not provided
        phone: userData.phone,
        addresses: [{
          addressId: uuidv4(),
          fullName: userData.fullName,
          addressLine1: userData.houseNo,
          addressLine2: userData.address,
          landmark: userData.landmark,
          city: userData.city,
          state: userData.state,
          pincode: userData.pincode,
          phone: userData.phone,
          country: 'India', // Add required country field
          isDefault: true
        }]
      });
      
      await user.save();
    }
    
    // Generate tracking ID
    const trackingId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Create order items with product references
    const orderItems = await Promise.all(cartItems.map(async (item: any) => {
      // Find product in database to get reference
      const product = await Product.findById(item._id);
      
      return {
        product: product ? product._id : null,
        name: item.name,
        price: item.discountedPrice || item.price,
        quantity: item.quantity,
        image: item.image
      };
    }));
    
    // Create order
    const order = new Order({
      trackingId,
      user: user._id,
      items: orderItems,
      shippingAddress: {
        fullName: userData.fullName,
        address: `${userData.houseNo}, ${userData.address}, ${userData.landmark}`,
        city: userData.city,
        postalCode: userData.pincode,
        state: userData.state,
        country: 'India',
        phone: userData.phone
      },
      alternatePhone: userData.alternatePhone,
      paymentMethod: 'Razorpay',
      itemsPrice: subtotal,
      shippingPrice: shippingCost,
      totalPrice: totalAmount,
      isPaid: false,
      isDelivered: false,
      status: 'Pending'
    });
    
    await order.save();
    
    return NextResponse.json({
      success: true,
      orderId: order._id.toString(),
      trackingId
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 