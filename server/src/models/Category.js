import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 80
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    description: {
      type: String,
      maxlength: 300,
      default: ''
    },
    color: {
      type: String,
      default: '#5b7cfa'
    }
  },
  { timestamps: true }
);

categorySchema.pre('save', function makeSlug(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Category', categorySchema);
