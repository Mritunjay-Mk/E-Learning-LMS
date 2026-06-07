import { body } from 'express-validator';
import Category from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const categoryRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Category name is required.'),
  body('description').optional().trim().isLength({ max: 300 }),
  body('color').optional().trim()
];

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
