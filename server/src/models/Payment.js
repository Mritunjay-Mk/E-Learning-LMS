import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['course', 'library'],
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    provider: {
      type: String,
      enum: ['razorpay', 'mock'],
      default: 'razorpay'
    },
    orderId: {
      type: String,
      required: true,
      index: true
    },
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created'
    },
    receipt: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    paidAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
