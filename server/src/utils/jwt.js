import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

export const setAuthCookie = (res, token) => {
  res.cookie('learnhub_token', token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    expires: new Date(Date.now() + env.cookieExpiresDays * 24 * 60 * 60 * 1000)
  });
};
