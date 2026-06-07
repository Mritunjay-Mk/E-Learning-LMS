import dotenv from 'dotenv';

dotenv.config();

const parseOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  productionClientUrl: process.env.PRODUCTION_CLIENT_URL || '',
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173'),
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || 'learnhub_ai_lms',
  jwtSecret: process.env.JWT_SECRET || 'development_only_change_this_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieExpiresDays: Number(process.env.COOKIE_EXPIRES_DAYS) || 7,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  libraryPriceInr: Number(process.env.LIBRARY_PRICE_INR) || 499,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  mailFrom: process.env.MAIL_FROM || 'LearnHub AI LMS <no-reply@learnhub.ai>'
};

export const assertProductionEnv = () => {
  if (!env.isProduction) return;

  const required = [
    ['MONGO_URI', env.mongoUri],
    ['JWT_SECRET', env.jwtSecret],
    ['RAZORPAY_KEY_ID', env.razorpayKeyId],
    ['RAZORPAY_KEY_SECRET', env.razorpayKeySecret],
    ['GEMINI_API_KEY', env.geminiApiKey],
    ['CLOUDINARY_CLOUD_NAME', env.cloudinaryCloudName],
    ['CLOUDINARY_API_KEY', env.cloudinaryApiKey],
    ['CLOUDINARY_API_SECRET', env.cloudinaryApiSecret]
  ];

  const missing = required.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
};
