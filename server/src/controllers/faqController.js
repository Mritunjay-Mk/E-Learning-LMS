import Faq from '../models/Faq.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Get all active FAQs (public)
 * @route   GET /api/faqs
 */
export const listFaqs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { isActive: true };

  if (category) {
    filter.category = category;
  }

  const faqs = await Faq.find(filter).sort({ order: 1, createdAt: 1 });

  res.json({
    success: true,
    count: faqs.length,
    faqs
  });
});

/**
 * @desc    Get all FAQs including inactive (admin only)
 * @route   GET /api/faqs/admin
 */
export const listAllFaqsAdmin = asyncHandler(async (req, res) => {
  const faqs = await Faq.find().sort({ category: 1, order: 1 });
  res.json({
    success: true,
    count: faqs.length,
    faqs
  });
});

/**
 * @desc    Create a new FAQ (admin only)
 * @route   POST /api/faqs
 */
export const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, category, order, isActive } = req.body;

  if (!question || !answer) {
    throw new ApiError(400, 'Question and answer are required.');
  }

  const faq = await Faq.create({
    question,
    answer,
    category: category || 'General',
    order: order ? Number(order) : 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  res.status(201).json({
    success: true,
    message: 'FAQ created successfully.',
    faq
  });
});

/**
 * @desc    Update an existing FAQ (admin only)
 * @route   PATCH /api/faqs/:id
 */
export const updateFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await Faq.findById(id);

  if (!faq) {
    throw new ApiError(404, 'FAQ not found.');
  }

  const updated = await Faq.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });

  res.json({
    success: true,
    message: 'FAQ updated successfully.',
    faq: updated
  });
});

/**
 * @desc    Delete an FAQ (admin only)
 * @route   DELETE /api/faqs/:id
 */
export const deleteFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await Faq.findById(id);

  if (!faq) {
    throw new ApiError(404, 'FAQ not found.');
  }

  await faq.deleteOne();

  res.json({
    success: true,
    message: 'FAQ deleted successfully.'
  });
});

