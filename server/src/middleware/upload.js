import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const pdfTypes = ['application/pdf'];

export const uploadImage = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!imageTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Only JPEG, PNG, and WebP images are allowed.'));
    }
    cb(null, true);
  }
});

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!pdfTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Only PDF files are allowed.'));
    }
    cb(null, true);
  }
});
