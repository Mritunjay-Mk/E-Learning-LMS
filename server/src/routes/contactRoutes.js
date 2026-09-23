import express from 'express';
import {
  contactRules,
  createContactMessage,
  deleteContactMessage,
  listContactMessages,
  updateContactStatus
} from '../controllers/contactController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Public route to submit inquiry
router.post('/', contactRules, validate, createContactMessage);

// Admin-only routes to manage inquiries
router.get('/', protect, authorize('admin'), listContactMessages);
router.patch('/:id', protect, authorize('admin'), updateContactStatus);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

export default router;
