import mongoose from 'mongoose';
import { env } from '../config/env.js';

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong.';
  let details = error.details;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed.';
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session is invalid or expired. Please sign in again.';
  }

  if (!env.isProduction) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: env.isProduction ? undefined : error.stack
  });
};
