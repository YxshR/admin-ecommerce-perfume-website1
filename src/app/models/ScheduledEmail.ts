import mongoose, { Schema } from 'mongoose';

const ButtonSchema = new Schema({
  text: { type: String, required: true },
  link: { type: String, required: true }
});

const StyleSchema = new Schema({
  backgroundColor: { type: String, default: '#ffffff' },
  textColor: { type: String, default: '#333333' },
  accentColor: { type: String, default: '#c19b6c' },
  headingAlignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
  logoAlignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
  contentAlignment: { type: String, enum: ['left', 'center', 'right'], default: 'left' }
});

const AttachmentSchema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number },
  url: { type: String, required: true }
});

const ScheduledEmailSchema = new Schema({
  template: {
    subject: { type: String, required: true },
    heading: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    buttonLink: { type: String, default: '' },
    buttons: [ButtonSchema],
    styles: { type: StyleSchema, default: () => ({}) }
  },
  recipients: [{ type: String, required: true }],
  scheduledTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'failed'],
    default: 'pending'
  },
  attachments: [AttachmentSchema],
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ScheduledEmail || mongoose.model('ScheduledEmail', ScheduledEmailSchema); 