import express from 'express';
import { body } from 'express-validator';
import { generateNotes, generateQuiz, generateSummary, tutorChat } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);
router.post('/chat', [body('message').trim().isLength({ min: 2 }).withMessage('Ask a clear question.')], validate, tutorChat);
router.post('/summary', [body('title').trim().isLength({ min: 2 }).withMessage('Lesson title is required.')], validate, generateSummary);
router.post('/notes', [body('lessonTitle').trim().isLength({ min: 2 }).withMessage('Lesson title is required.')], validate, generateNotes);
router.post('/quiz', [body('topic').trim().isLength({ min: 2 }).withMessage('Quiz topic is required.')], validate, generateQuiz);

export default router;
