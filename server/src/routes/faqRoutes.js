import express from 'express';
import {
  createFaq,
  deleteFaq,
  listAllFaqsAdmin,
  listFaqs,
  updateFaq
} from '../controllers/faqController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', listFaqs);

// Admin-protected routes
router.get('/admin', protect, authorize('admin'), listAllFaqsAdmin);
router.post('/', protect, authorize('admin'), createFaq);
router.patch('/:id', protect, authorize('admin'), updateFaq);
router.delete('/:id', protect, authorize('admin'), deleteFaq);

export default router;

