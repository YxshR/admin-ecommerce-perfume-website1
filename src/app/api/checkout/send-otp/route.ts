import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import OTP from '@/app/models/OTP';
import twilio from 'twilio';

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;
    
    // Validate phone number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes
    
    // Store OTP in database
    await OTP.findOneAndUpdate(
      { phone },
      { 
        phone,
        otp,
        expiresAt,
        verified: false
      },
      { upsert: true, new: true }
    );
    
    // Send OTP via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !twilioPhone) {
      console.error('Twilio credentials not configured');
      
      // For development, log the OTP instead of sending it
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
        return NextResponse.json({ success: true });
      }
      
      return NextResponse.json(
        { success: false, error: 'SMS service not configured' },
        { status: 500 }
      );
    }
    
    // For development or if the phone number matches Twilio number, just log the OTP
    if (process.env.NODE_ENV === 'development' || `+91${phone}` === twilioPhone) {
      console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
      return NextResponse.json({ success: true });
    }
    
    const client = twilio(accountSid, authToken);
    
    await client.messages.create({
      body: `Your Avito Scent verification code is: ${otp}. Valid for 10 minutes.`,
      from: twilioPhone, // Should already include the + country code prefix
      to: `+91${phone}`
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
} 