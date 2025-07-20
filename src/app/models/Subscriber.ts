import mongoose, { Schema, Document } from 'mongoose';

// Define the Subscriber interface
export interface ISubscriber extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

// Define the schema
const SubscriberSchema = new Schema<ISubscriber>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: {
    type: Date,
  },
});

// Create and export the model
export default mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema); 