import Testimonial from '../models/Testimonial.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Get featured testimonials (public)
 * @route   GET /api/testimonials
 */
export const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    count: testimonials.length,
    testimonials
  });
});

/**
 * @desc    Get all testimonials (admin)
 * @route   GET /api/testimonials/admin
 */
export const listAllTestimonialsAdmin = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    count: testimonials.length,
    testimonials
  });
});

/**
 * @desc    Create a new testimonial (admin)
 * @route   POST /api/testimonials
 */
export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, role, company, avatar, content, rating, courseName, featured } = req.body;

  if (!name || !role || !content) {
    throw new ApiError(400, 'Name, role, and content are required.');
  }

  const testimonial = await Testimonial.create({
    name,
    role,
    company: company || '',
    avatar: avatar || '',
    content,
    rating: rating ? Number(rating) : 5,
    courseName: courseName || '',
    featured: featured !== undefined ? Boolean(featured) : true
  });

  res.status(201).json({
    success: true,
    message: 'Testimonial created successfully.',
    testimonial
  });
});

/**
 * @desc    Delete a testimonial (admin)
 * @route   DELETE /api/testimonials/:id
 */
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findById(id);

  if (!testimonial) {
    throw new ApiError(404, 'Testimonial not found.');
  }

  await testimonial.deleteOne();

  res.json({
    success: true,
    message: 'Testimonial deleted successfully.'
  });
});

