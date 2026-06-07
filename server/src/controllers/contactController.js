import { body } from 'express-validator';
import ContactMessage from '../models/ContactMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const contactRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('subject').trim().isLength({ min: 3 }).withMessage('Subject is required.'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters.')
];

export const createContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(req.body);
  res.status(201).json({ success: true, message });
});
