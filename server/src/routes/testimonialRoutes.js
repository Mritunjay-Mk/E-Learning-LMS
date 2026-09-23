import express from 'express';
import {
  createTestimonial,
  deleteTestimonial,
  listAllTestimonialsAdmin,
  listTestimonials
} from '../controllers/testimonialController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', listTestimonials);

// Admin-protected routes
router.get('/admin', protect, authorize('admin'), listAllTestimonialsAdmin);
router.post('/', protect, authorize('admin'), createTestimonial);
router.delete('/:id', protect, authorize('admin'), deleteTestimonial);

export default router;

