import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    answer: String,
    explanation: String
  },
  { _id: false }
);

const moduleQuizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleIndex: { type: Number, required: true },
    moduleTitle: String,
    quiz: {
      title: String,
      questions: [quizQuestionSchema]
    },
    answers: [{ type: String }],
    score: Number,
    correctCount: Number,
    report: mongoose.Schema.Types.Mixed,
    submittedAt: Date
  },
  { timestamps: true }
);

moduleQuizSchema.index({ user: 1, course: 1, moduleIndex: 1 }, { unique: true });

export default mongoose.model('ModuleQuiz', moduleQuizSchema);
