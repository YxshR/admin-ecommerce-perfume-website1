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
  recipients: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Recipients must be a non-empty array of email addresses'
    }
  },
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

// Pre-save hook to ensure recipients is always an array
ScheduledEmailSchema.pre('save', function(next) {
  // If recipients is not an array or is empty, convert it
  if (!Array.isArray(this.recipients) || this.recipients.length === 0) {
    console.error('Invalid recipients format detected, attempting to fix');
    
    // If it's a string, try to split it
    if (typeof this.recipients === 'string') {
      this.recipients = this.recipients.split(',').map(email => email.trim());
    } 
    // If it's an object but not an array, try to extract values
    else if (typeof this.recipients === 'object') {
      this.recipients = Object.values(this.recipients);
    }
    
    // If still not valid, set a default
    if (!Array.isArray(this.recipients) || this.recipients.length === 0) {
      console.error('Could not fix recipients format, setting to failed status');
      this.status = 'failed';
    }
  }
  
  next();
});

export default mongoose.models.ScheduledEmail || mongoose.model('ScheduledEmail', ScheduledEmailSchema); 