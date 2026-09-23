import mongoose from 'mongoose';

/**
 * Testimonial Schema
 * Stores genuine student reviews and career success stories.
 * Displayed dynamically on the landing and about pages.
 */
const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: 100
    },
    role: {
      type: String,
      required: [true, 'Student role or job title is required'],
      trim: true,
      maxlength: 120
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      required: [true, 'Testimonial content is required'],
      trim: true,
      maxlength: 1000
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    courseName: {
      type: String,
      trim: true,
      default: ''
    },
    featured: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

testimonialSchema.index({ featured: 1, createdAt: -1 });

export default mongoose.model('Testimonial', testimonialSchema);

