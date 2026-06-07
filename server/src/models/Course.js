import mongoose from 'mongoose';
import slugify from 'slugify';
import { getYouTubeThumbnail } from '../utils/youtube.js';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true },
    duration: { type: String, default: '10 min' },
    isPreview: { type: Boolean, default: false },
    resources: [{ title: String, url: String }]
  },
  { _id: true }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    lessons: [lessonSchema]
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    subtitle: {
      type: String,
      maxlength: 180,
      default: ''
    },
    description: {
      type: String,
      required: true,
      maxlength: 6000
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    language: {
      type: String,
      default: 'English'
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    discountPrice: {
      type: Number,
      min: 0
    },
    duration: {
      type: String,
      default: '6 hours'
    },
    previewVideoUrl: {
      type: String,
      trim: true,
      default: ''
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      default: ''
    },
    curriculum: [moduleSchema],
    outcomes: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    instructor: {
      name: { type: String, default: 'LearnHub Faculty' },
      title: { type: String, default: 'Senior mentor' },
      avatar: { type: String, default: '' },
      bio: { type: String, default: '' }
    },
    instructorOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    studentsCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    featured: {
      type: Boolean,
      default: false
    },
    publishedAt: Date
  },
  { timestamps: true }
);

courseSchema.pre('save', function prepareCourse(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if ((this.isModified('previewVideoUrl') || !this.thumbnailUrl) && this.previewVideoUrl) {
    this.thumbnailUrl = getYouTubeThumbnail(this.previewVideoUrl);
  }

  if (!this.coverImage && this.thumbnailUrl) {
    this.coverImage = this.thumbnailUrl;
  }

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

courseSchema.index({ title: 'text', subtitle: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Course', courseSchema);
