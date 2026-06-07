import Enrollment from '../models/Enrollment.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireLibraryAccess = asyncHandler(async (req, _res, next) => {
  if (req.user.role === 'admin' || req.user.libraryAccess) return next();

  const courseEnrollment = await Enrollment.exists({
    user: req.user._id,
    status: { $in: ['active', 'completed'] }
  });

  if (!courseEnrollment) {
    throw new ApiError(402, 'Library access requires a course purchase or a library pass.');
  }

  next();
});
