import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answer: {
      type: String,
      trim: true,
      default: ''
    },
    submittedAt: Date,
    marks: {
      type: Number,
      min: 0,
      default: null
    },
    feedback: {
      type: String,
      trim: true,
      default: ''
    },
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 160
    },
    instructions: {
      type: String,
      trim: true,
      required: true,
      maxlength: 5000
    },
    dueDate: Date,
    maxMarks: {
      type: Number,
      min: 1,
      default: 100
    },
    submissions: [submissionSchema]
  },
  { timestamps: true }
);

assignmentSchema.index({ course: 1, createdAt: -1 });

export default mongoose.model('Assignment', assignmentSchema);
