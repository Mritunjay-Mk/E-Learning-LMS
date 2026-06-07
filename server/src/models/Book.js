import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      maxlength: 1200,
      default: ''
    },
    pdfUrl: {
      type: String,
      required: true
    },
    pdfPublicId: String,
    coverImage: {
      type: String,
      default: ''
    },
    coverPublicId: String,
    pages: Number,
    downloads: {
      type: Number,
      default: 0
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', description: 'text', category: 'text' });

export default mongoose.model('Book', bookSchema);
