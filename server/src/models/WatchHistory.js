import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: String, required: true },
    moduleIndex: Number,
    lessonIndex: Number,
    currentTime: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

watchHistorySchema.index({ user: 1, course: 1, lessonId: 1 }, { unique: true });

export default mongoose.model('WatchHistory', watchHistorySchema);
