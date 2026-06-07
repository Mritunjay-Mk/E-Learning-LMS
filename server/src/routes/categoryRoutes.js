import express from 'express';
import { categoryRules, createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/categoryController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', listCategories);
router.post('/', protect, authorize('admin'), categoryRules, validate, createCategory);
router.patch('/:id', protect, authorize('admin'), categoryRules, validate, updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
