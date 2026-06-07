import { body } from 'express-validator';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createOrderRules = [
  body('type').isIn(['course', 'library']).withMessage('Payment type must be course or library.'),
  body('courseId').optional().isMongoId().withMessage('Invalid course id.')
];

export const createOrder = asyncHandler(async (req, res) => {
  const { type, courseId } = req.body;
  let amount = env.libraryPriceInr;
  let course = null;

  if (type === 'course') {
    course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found.');

    const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (existing) throw new ApiError(409, 'You already own this course.');

    amount = course.discountPrice || course.price;
    if (amount <= 0) {
      const enrollment = await Enrollment.create({ user: req.user._id, course: course._id, status: 'active' });
      await Course.findByIdAndUpdate(course._id, { $inc: { studentsCount: 1 } });
      return res.status(201).json({ success: true, free: true, enrollment });
    }
  }

  const receipt = `${type}_${req.user._id.toString().slice(-6)}_${Date.now()}`;
  const order = await createRazorpayOrder({
    amount,
    receipt,
    notes: { type, courseId: course?._id?.toString() || '' }
  });

  const payment = await Payment.create({
    user: req.user._id,
    type,
    course: course?._id,
    amount,
    provider: order.provider,
    orderId: order.id,
    receipt
  });

  res.status(201).json({
    success: true,
    order,
    payment,
    razorpayKeyId: env.razorpayKeyId || 'mock_key',
    user: {
      name: req.user.name,
      email: req.user.email
    }
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  const payment = await Payment.findOne({ orderId, user: req.user._id });
  if (!payment) throw new ApiError(404, 'Payment order not found.');

  const isValid = verifyRazorpaySignature({ orderId, paymentId, signature });
  if (!isValid) {
    payment.status = 'failed';
    await payment.save();
    throw new ApiError(400, 'Payment verification failed.');
  }

  payment.status = 'paid';
  payment.razorpayPaymentId = paymentId;
  payment.razorpaySignature = signature;
  payment.paidAt = new Date();
  await payment.save();

  let enrollment = null;
  let user = req.user;

  if (payment.type === 'course') {
    enrollment = await Enrollment.findOneAndUpdate(
      { user: req.user._id, course: payment.course },
      { user: req.user._id, course: payment.course, payment: payment._id, status: 'active' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Course.findByIdAndUpdate(payment.course, { $inc: { studentsCount: 1 } });
  } else {
    user = await User.findByIdAndUpdate(
      req.user._id,
      { libraryAccess: true, libraryAccessPayment: payment._id },
      { new: true }
    );
  }

  res.json({ success: true, payment, enrollment, user });
});

export const orderHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).populate('course', 'title slug thumbnailUrl').sort('-createdAt');
  res.json({ success: true, payments });
});
