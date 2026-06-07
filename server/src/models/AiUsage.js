import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    feature: {
      type: String,
      enum: ['tutor', 'notes', 'summary', 'quiz', 'curriculum', 'quiz-report', 'course-recommendations'],
      required: true
    },
    promptTokens: Number,
    responseLength: Number
  },
  { timestamps: true }
);

export default mongoose.model('AiUsage', aiUsageSchema);
