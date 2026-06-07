import express from 'express';
import { listModuleQuizReports, startModuleQuiz, submitModuleQuiz } from '../controllers/moduleQuizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/reports', listModuleQuizReports);
router.post('/courses/:courseId/modules/:moduleIndex/start', startModuleQuiz);
router.patch('/:id/submit', submitModuleQuiz);

export default router;
