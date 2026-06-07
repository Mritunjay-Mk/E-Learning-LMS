import mongoose from 'mongoose';

const courseRequestSchema = new mongoose.Schema(
  {
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    adminNote: {
      type: String,
      default: ''
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('CourseRequest', courseRequestSchema);
