import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['new', 'read', 'resolved'],
      default: 'new'
    }
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
