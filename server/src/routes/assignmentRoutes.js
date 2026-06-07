import express from 'express';
import { createAssignment, gradeSubmission, listAssignments, submitAssignment } from '../controllers/assignmentController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', listAssignments);
router.post('/', authorize('admin', 'educator'), createAssignment);
router.patch('/:id/submit', authorize('student', 'admin'), submitAssignment);
router.patch('/:id/submissions/:studentId', authorize('admin', 'educator'), gradeSubmission);

export default router;
