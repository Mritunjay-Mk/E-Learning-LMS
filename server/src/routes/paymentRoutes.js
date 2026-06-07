import express from 'express';
import { createOrder, createOrderRules, orderHistory, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);
router.post('/create-order', createOrderRules, validate, createOrder);
router.post('/verify', verifyPayment);
router.get('/history', orderHistory);

export default router;
