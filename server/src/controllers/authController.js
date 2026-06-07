import crypto from 'crypto';
import { body } from 'express-validator';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setAuthCookie, signToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';

const authResponse = (res, statusCode, user) => {
  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.status(statusCode).json({ success: true, token, user });
};

export const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const firstUser = (await User.countDocuments()) === 0;
  const user = await User.create({
    name,
    email,
    password,
    role: firstUser ? 'admin' : 'student'
  });

  authResponse(res, 201, user);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  authResponse(res, 200, user);
});

export const logout = (_req, res) => {
  res.clearCookie('learnhub_token');
  res.json({ success: true });
};

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'bio', 'headline', 'avatar'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  user.password = password;
  await user.save();
  authResponse(res, 200, user);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({ success: true, message: 'If that account exists, a reset link has been sent.' });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your LearnHub AI LMS password',
    html: `<p>Hello ${user.name},</p><p>Reset your password here:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 15 minutes.</p>`
  });

  res.json({
    success: true,
    message: 'If that account exists, a reset link has been sent.',
    resetUrl: env.isProduction ? undefined : resetUrl
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) throw new ApiError(400, 'Password reset token is invalid or has expired.');

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  authResponse(res, 200, user);
});
