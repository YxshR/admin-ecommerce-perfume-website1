import mongoose, { Schema, models } from 'mongoose';

const OTPSchema = new Schema({
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // OTP expires after 10 minutes (600 seconds)
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
});

export default models.OTP || mongoose.model('OTP', OTPSchema); 