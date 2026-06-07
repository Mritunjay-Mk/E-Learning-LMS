import express from 'express';
import { analytics, deleteUser, listPayments, listUsers, updateUser } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/analytics', analytics);
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/payments', listPayments);

export default router;
