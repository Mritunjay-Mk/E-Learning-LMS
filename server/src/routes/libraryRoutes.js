import express from 'express';
import {
  bookRules,
  createBook,
  deleteBook,
  downloadBook,
  getBook,
  listBooks,
  updateBook
} from '../controllers/libraryController.js';
import { authorize, optionalAuth, protect } from '../middleware/auth.js';
import { requireLibraryAccess } from '../middleware/libraryAccess.js';
import { uploadPdf } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/books', optionalAuth, listBooks);
router.get('/books/:id', protect, requireLibraryAccess, getBook);
router.get('/books/:id/download', protect, requireLibraryAccess, downloadBook);
router.post('/books', protect, authorize('admin'), uploadPdf.single('pdf'), bookRules, validate, createBook);
router.patch('/books/:id', protect, authorize('admin'), uploadPdf.single('pdf'), updateBook);
router.delete('/books/:id', protect, authorize('admin'), deleteBook);

export default router;
