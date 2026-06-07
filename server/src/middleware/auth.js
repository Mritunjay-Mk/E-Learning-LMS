import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return req.cookies?.learnhub_token;
};

export const protect = asyncHandler(async (req, _res, next) => {
  const token = getToken(req);
  if (!token) throw new ApiError(401, 'Please sign in to continue.');

  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'The user belonging to this token no longer exists.');

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = getToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = await User.findById(decoded.id);
  } catch {
    req.user = null;
  }

  next();
});

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
