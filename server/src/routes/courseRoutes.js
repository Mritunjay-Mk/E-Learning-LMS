import express from 'express';
import {
  addReview,
  courseRules,
  createCourse,
  deleteCourse,
  featuredCourses,
  getCourse,
  getProgress,
  listCourses,
  listReviews,
  myCourses,
  updateCourse,
  updateProgress
} from '../controllers/courseController.js';
import { authorize, optionalAuth, protect } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', optionalAuth, listCourses);
router.get('/featured', featuredCourses);
router.get('/mine', protect, myCourses);
router.post('/', protect, authorize('admin'), uploadImage.single('cover'), courseRules, validate, createCourse);
router.get('/:slug', optionalAuth, getCourse);
router.patch('/:id', protect, authorize('admin', 'educator'), uploadImage.single('cover'), updateCourse);
router.delete('/:id', protect, authorize('admin', 'educator'), deleteCourse);
router.get('/:id/reviews', listReviews);
router.post('/:id/reviews', protect, addReview);
router.get('/:id/progress', protect, getProgress);
router.patch('/:id/progress', protect, updateProgress);

export default router;
