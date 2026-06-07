import AiUsage from '../models/AiUsage.js';
import Book from '../models/Book.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../utils/pagination.js';

export const analytics = asyncHandler(async (_req, res) => {
  const [
    users,
    courses,
    books,
    enrollments,
    revenue,
    monthlyRevenue,
    aiUsage,
    recentPayments
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Book.countDocuments(),
    Enrollment.countDocuments(),
    Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]),
    AiUsage.aggregate([{ $group: { _id: '$feature', count: { $sum: 1 } } }]),
    Payment.find().populate('user', 'name email').populate('course', 'title').sort('-createdAt').limit(8)
  ]);

  res.json({
    success: true,
    stats: {
      users,
      courses,
      books,
      enrollments,
      revenue: revenue[0]?.total || 0
    },
    monthlyRevenue,
    aiUsage,
    recentPayments
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = req.query.search
    ? { $or: [{ name: new RegExp(req.query.search, 'i') }, { email: new RegExp(req.query.search, 'i') }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const allowed = ['name', 'role', 'libraryAccess', 'educatorSubject'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [payments, total] = await Promise.all([
    Payment.find().populate('user', 'name email').populate('course', 'title slug').sort('-createdAt').skip(skip).limit(limit),
    Payment.countDocuments()
  ]);
  res.json({ success: true, payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
