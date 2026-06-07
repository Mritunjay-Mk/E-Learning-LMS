import express from 'express';
import { body } from 'express-validator';
import {
  changePassword,
  forgotPassword,
  login,
  loginRules,
  logout,
  me,
  register,
  registerRules,
  resetPassword,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.patch('/profile', protect, updateProfile);
router.patch(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
  ],
  validate,
  changePassword
);
router.post('/forgot-password', [body('email').isEmail().withMessage('Valid email is required.').normalizeEmail()], validate, forgotPassword);
router.post('/reset-password/:token', [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')], validate, resetPassword);

export default router;
