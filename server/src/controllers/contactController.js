import { body } from 'express-validator';
import ContactMessage from '../models/ContactMessage.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const contactRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('subject').trim().isLength({ min: 3 }).withMessage('Subject is required.'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters.')
];

/**
 * @desc    Submit a new contact inquiry (public)
 * @route   POST /api/contact
 */
export const createContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Your inquiry has been received. Our team will contact you shortly.',
    data: message
  });
});

/**
 * @desc    List all contact inquiries (admin only)
 * @route   GET /api/contact
 */
export const listContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    count: messages.length,
    messages
  });
});

/**
 * @desc    Update status of a contact inquiry (admin only)
 * @route   PATCH /api/contact/:id
 */
export const updateContactStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['new', 'read', 'resolved'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status. Must be new, read, or resolved.');
  }

  const message = await ContactMessage.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  );

  if (!message) {
    throw new ApiError(404, 'Message not found.');
  }

  res.json({
    success: true,
    message: 'Message status updated.',
    data: message
  });
});

/**
 * @desc    Delete a contact inquiry (admin only)
 * @route   DELETE /api/contact/:id
 */
export const deleteContactMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const message = await ContactMessage.findById(id);

  if (!message) {
    throw new ApiError(404, 'Message not found.');
  }

  await message.deleteOne();

  res.json({
    success: true,
    message: 'Message deleted successfully.'
  });
});
