import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { xssSanitizer } from './middleware/xssSanitizer.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import courseRequestRoutes from './routes/courseRequestRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import moduleQuizRoutes from './routes/moduleQuizRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

const isLocalDevOrigin = (origin) => {
  if (env.isProduction) return false;

  try {
    const { hostname, port, protocol } = new URL(origin);
    return protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(hostname) && /^517\d$/.test(port);
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (env.allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xssSanitizer);
app.use(hpp());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);

if (!env.isProduction) app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'LearnHub AI LMS API',
    time: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-requests', courseRequestRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/module-quizzes', moduleQuizRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
