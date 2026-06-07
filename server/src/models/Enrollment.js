import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'refunded'],
      default: 'active'
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    completedLessons: [
      {
        lessonId: String,
        completedAt: Date
      }
    ],
    lastWatched: {
      lessonId: String,
      moduleIndex: Number,
      lessonIndex: Number,
      currentTime: Number,
      updatedAt: Date
    },
    certificateIssued: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
