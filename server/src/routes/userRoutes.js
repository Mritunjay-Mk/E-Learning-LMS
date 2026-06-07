import express from 'express';
import { dashboard, recommendations } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, dashboard);
router.get('/recommendations', protect, recommendations);

export default router;
