import express from 'express';
import { getInstructors, getPlatformStats } from '../controllers/publicController.js';

const router = express.Router();

router.get('/stats', getPlatformStats);
router.get('/instructors', getInstructors);

export default router;

