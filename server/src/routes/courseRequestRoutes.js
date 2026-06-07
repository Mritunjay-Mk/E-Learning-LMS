import express from 'express';
import { createCourseRequest, listCourseRequests, reviewCourseRequest } from '../controllers/courseRequestController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin'), listCourseRequests);
router.get('/mine', authorize('educator'), listCourseRequests);
router.post('/', authorize('educator'), createCourseRequest);
router.patch('/:id/review', authorize('admin'), reviewCourseRequest);

export default router;
