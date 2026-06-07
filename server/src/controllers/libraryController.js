import { body } from 'express-validator';
import Book from '../models/Book.js';
import Enrollment from '../models/Enrollment.js';
import { env } from '../config/env.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinaryService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../utils/pagination.js';

const hasAccess = async (user) => {
  if (!user) return false;
  if (user.role === 'admin' || user.libraryAccess) return true;
  return Boolean(
    await Enrollment.exists({
      user: user._id,
      status: { $in: ['active', 'completed'] }
    })
  );
};

export const bookRules = [
  body('title').trim().isLength({ min: 2 }).withMessage('Book title is required.'),
  body('author').trim().isLength({ min: 2 }).withMessage('Author is required.'),
  body('category').trim().isLength({ min: 2 }).withMessage('Book category is required.')
];

export const listBooks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search) filter.$text = { $search: req.query.search };
  if (req.query.category) filter.category = new RegExp(req.query.category, 'i');

  const [books, total, access] = await Promise.all([
    Book.find(filter).sort(req.query.sort === 'popular' ? '-downloads' : '-createdAt').skip(skip).limit(limit),
    Book.countDocuments(filter),
    hasAccess(req.user)
  ]);

  res.json({
    success: true,
    books,
    hasAccess: access,
    libraryPrice: env.libraryPriceInr,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found.');
  res.json({ success: true, book });
});

export const createBook = asyncHandler(async (req, res) => {
  if (!req.file && !req.body.pdfUrl) throw new ApiError(400, 'Upload a PDF or provide a PDF URL.');

  let pdfUrl = req.body.pdfUrl;
  let pdfPublicId = '';

  if (req.file) {
    const upload = await uploadToCloudinary(req.file, 'learnhub/library', 'raw');
    pdfUrl = upload.secure_url;
    pdfPublicId = upload.public_id;
  }

  const book = await Book.create({
    ...req.body,
    pdfUrl,
    pdfPublicId,
    uploadedBy: req.user._id
  });

  res.status(201).json({ success: true, book });
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found.');

  const updates = { ...req.body };
  if (req.file) {
    if (book.pdfPublicId) await deleteFromCloudinary(book.pdfPublicId, 'raw');
    const upload = await uploadToCloudinary(req.file, 'learnhub/library', 'raw');
    updates.pdfUrl = upload.secure_url;
    updates.pdfPublicId = upload.public_id;
  }

  Object.assign(book, updates);
  await book.save();
  res.json({ success: true, book });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found.');
  if (book.pdfPublicId) await deleteFromCloudinary(book.pdfPublicId, 'raw');
  await book.deleteOne();
  res.json({ success: true });
});

export const downloadBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
  if (!book) throw new ApiError(404, 'Book not found.');
  res.json({ success: true, downloadUrl: book.pdfUrl });
});
