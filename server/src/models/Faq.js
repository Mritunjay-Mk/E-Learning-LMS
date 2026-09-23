import mongoose from 'mongoose';

/**
 * FAQ Schema
 * Stores platform frequently asked questions categorized by topic.
 * Fully managed via Admin Dashboard and queried publicly by students.
 */
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: 300
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      maxlength: 3000
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['General', 'Courses', 'Payments & Billing', 'AI Tutor', 'Certificates'],
      default: 'General'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

faqSchema.index({ category: 1, order: 1, isActive: 1 });

export default mongoose.model('Faq', faqSchema);

