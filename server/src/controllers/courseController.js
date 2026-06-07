import { body } from 'express-validator';
import slugify from 'slugify';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import WatchHistory from '../models/WatchHistory.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureAiCourseDetails, ensureAiCurriculum, looksLikeDefaultCurriculum } from '../utils/curriculumAi.js';
import { getPagination } from '../utils/pagination.js';
import { getYouTubeThumbnail } from '../utils/youtube.js';

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const resolveCategory = async (value) => {
  if (!value) throw new ApiError(400, 'Category is required.');

  let category = await Category.findById(value).catch(() => null);
  if (!category) {
    category = await Category.findOne({ $or: [{ slug: value }, { name: new RegExp(`^${value}$`, 'i') }] });
  }
  if (!category) {
    category = await Category.create({ name: value });
  }
  return category._id;
};

const ensureEducatorSubject = async (req, categoryId) => {
  if (req.user?.role !== 'educator') return;

  if (!req.user.educatorSubject) {
    throw new ApiError(403, 'Ask admin to assign your educator subject first.');
  }

  const category = await Category.findById(categoryId);
  const subject = req.user.educatorSubject.trim().toLowerCase();
  const matchesSubject = category && [category.name, category.slug].some((value) => value?.toLowerCase() === subject);

  if (!matchesSubject) {
    throw new ApiError(403, 'Educators can manage courses only for their assigned subject.');
  }
};

const ensureCanManageCourse = async (req, courseId) => {
  if (req.user?.role === 'admin') return null;

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found.');
  if (String(course.instructorOwner || '') !== String(req.user._id)) {
    throw new ApiError(403, 'You can manage only your own courses.');
  }
  return course;
};

const normalizeCoursePayload = async (req, requireCategory = true) => {
  const payload = { ...req.body };
  if (payload.category || payload.categoryId || requireCategory) {
    payload.category = await resolveCategory(payload.category || payload.categoryId);
    await ensureEducatorSubject(req, payload.category);
  }
  if (payload.price !== undefined) {
    payload.price = Number(payload.price || 0);
  }
  if (payload.discountPrice !== undefined && payload.discountPrice !== '') {
    payload.discountPrice = Number(payload.discountPrice);
  }
  if (payload.curriculum !== undefined) payload.curriculum = parseMaybeJson(payload.curriculum, []);
  if (payload.outcomes !== undefined) payload.outcomes = parseMaybeJson(payload.outcomes, []);
  if (payload.requirements !== undefined) payload.requirements = parseMaybeJson(payload.requirements, []);
  if (payload.tags !== undefined) payload.tags = parseMaybeJson(payload.tags, []);
  if (payload.instructor !== undefined) payload.instructor = parseMaybeJson(payload.instructor, payload.instructor || undefined);

  if (payload.previewVideoUrl && !payload.thumbnailUrl) {
    payload.thumbnailUrl = getYouTubeThumbnail(payload.previewVideoUrl);
  }

  if (req.file) {
    const upload = await uploadToCloudinary(req.file, 'learnhub/courses', 'image');
    payload.coverImage = upload.secure_url;
  }

  return payload;
};

const applyAdminInstructorOwner = async (payload, isNew = false) => {
  if (payload.instructorOwner === undefined) return;

  if (!payload.instructorOwner) {
    if (isNew) {
      delete payload.instructorOwner;
    } else {
      payload.instructorOwner = null;
    }
    return;
  }

  const educator = await User.findOne({ _id: payload.instructorOwner, role: 'educator' });
  if (!educator) throw new ApiError(400, 'Assign a valid educator account to this course.');

  payload.instructorOwner = educator._id;
  payload.instructor = {
    name: educator.name,
    title: educator.headline || `${educator.educatorSubject || 'Course'} educator`,
    avatar: educator.avatar || '',
    bio: educator.bio || ''
  };
};

const recomputeCourseRating = async (courseId) => {
  const [stats] = await Review.aggregate([
    { $match: { course: courseId } },
    { $group: { _id: '$course', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  await Course.findByIdAndUpdate(courseId, {
    ratingAverage: stats ? Number(stats.average.toFixed(1)) : 0,
    ratingCount: stats?.count || 0
  });
};

const hasCourseAccess = (req, course, enrollment) => {
  const ownsCourse = String(course.instructorOwner || '') === String(req.user?._id || '');
  const validEnrollment = enrollment && enrollment.status !== 'refunded';
  return Boolean(validEnrollment || req.user?.role === 'admin' || ownsCourse);
};

const sanitizeCourseForAccess = (course, canAccess) => {
  const courseObject = course.toObject ? course.toObject() : course;
  if (canAccess) return courseObject;

  return {
    ...courseObject,
    curriculum: courseObject.curriculum?.map((module) => ({
      ...module,
      lessons: module.lessons?.map((lesson) => ({
        ...lesson,
        videoUrl: ''
      }))
    }))
  };
};

const normalizeCourseLookup = (value = '') =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\bor\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const findCourseByIdentifier = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return Course.findById(identifier).populate('category');
  }

  const exactCourse = await Course.findOne({ slug: identifier }).populate('category');
  if (exactCourse) return exactCourse;

  const requested = normalizeCourseLookup(identifier);
  const courses = await Course.find({}).populate('category');
  return courses.find((course) => {
    const titleSlug = slugify(course.title || '', { lower: true, strict: true });
    return [course.slug, course.title, titleSlug].some((value) => normalizeCourseLookup(value || '') === requested);
  });
};

export const courseRules = [
  body('title').trim().isLength({ min: 3 }).withMessage('Course title is required.'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters.'),
  body('price').isNumeric().withMessage('Course price is required.'),
  body('category').optional().notEmpty(),
  body('categoryId').optional().notEmpty()
];

export const listCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  let filter = req.user?.role === 'admin' && req.query.includeDrafts === 'true' ? {} : { status: 'published' };

  if (req.user?.role === 'educator' && req.query.includeDrafts === 'true') {
    filter = { instructorOwner: req.user._id };
  }

  if (req.query.search) filter.$text = { $search: req.query.search };
  if (req.query.level) filter.level = req.query.level;
  if (req.query.category) {
    const category = await Category.findOne({
      $or: [{ slug: req.query.category }, { name: new RegExp(`^${req.query.category}$`, 'i') }]
    });
    if (category) filter.category = category._id;
  }
  if (req.query.price === 'free') filter.price = 0;
  if (req.query.price === 'paid') filter.price = { $gt: 0 };

  const sortMap = {
    newest: '-createdAt',
    popular: '-studentsCount',
    rating: '-ratingAverage',
    priceLow: 'price',
    priceHigh: '-price'
  };

  const sort = sortMap[req.query.sort] || '-featured -createdAt';
  const [courses, total] = await Promise.all([
    Course.find(filter).populate('category').populate('instructorOwner', 'name email educatorSubject').sort(sort).skip(skip).limit(limit),
    Course.countDocuments(filter)
  ]);

  res.json({
    success: true,
    courses,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

export const featuredCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find({ featured: true, status: 'published' })
    .populate('category')
    .sort('-studentsCount')
    .limit(6);
  res.json({ success: true, courses });
});

export const getCourse = asyncHandler(async (req, res) => {
  let course = await findCourseByIdentifier(req.params.slug);
  if (!course) throw new ApiError(404, 'Course not found.');

  if (looksLikeDefaultCurriculum(course.curriculum)) {
    const payload = {
      title: course.title,
      description: course.description,
      level: course.level,
      curriculum: course.curriculum
    };
    await ensureAiCurriculum(payload);
    if (!looksLikeDefaultCurriculum(payload.curriculum)) {
      course.curriculum = payload.curriculum;
      await course.save();
      course = await Course.findById(course._id).populate('category');
    }
  }

  let enrollment = null;
  if (req.user) {
    enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
  }

  const canAccess = hasCourseAccess(req, course, enrollment);
  res.json({ success: true, course: sanitizeCourseForAccess(course, canAccess), enrollment, hasAccess: canAccess });
});

export const createCourse = asyncHandler(async (req, res) => {
  const payload = await normalizeCoursePayload(req, true);
  await ensureAiCourseDetails(payload);
  await ensureAiCurriculum(payload);
  if (req.user?.role === 'educator') {
    payload.instructorOwner = req.user._id;
    payload.instructor = {
      name: req.user.name,
      title: req.user.headline || `${req.user.educatorSubject} educator`,
      avatar: req.user.avatar || '',
      bio: req.user.bio || ''
    };
  } else if (req.user?.role === 'admin') {
    await applyAdminInstructorOwner(payload, true);
  }
  const course = await Course.create(payload);
  res.status(201).json({ success: true, course });
});

export const updateCourse = asyncHandler(async (req, res) => {
  await ensureCanManageCourse(req, req.params.id);
  const payload = await normalizeCoursePayload(req, false);
  await ensureAiCourseDetails(payload);
  if (payload.curriculum !== undefined) await ensureAiCurriculum(payload);
  if (req.user?.role === 'educator') {
    delete payload.instructorOwner;
    delete payload.featured;
  } else if (req.user?.role === 'admin') {
    await applyAdminInstructorOwner(payload);
  }
  const course = await Course.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  }).populate('category');
  if (!course) throw new ApiError(404, 'Course not found.');
  res.json({ success: true, course });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await ensureCanManageCourse(req, req.params.id);
  await Course.findByIdAndDelete(req.params.id);
  await Enrollment.deleteMany({ course: req.params.id });
  await Review.deleteMany({ course: req.params.id });
  res.json({ success: true });
});

export const myCourses = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id })
    .populate({ path: 'course', populate: 'category' })
    .sort('-updatedAt');

  res.json({ success: true, enrollments });
});

export const addReview = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.id });
  if (!enrollment && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only enrolled students can review this course.');
  }

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, course: req.params.id },
    { rating: req.body.rating, comment: req.body.comment },
    { upsert: true, new: true, runValidators: true }
  ).populate('user', 'name avatar');

  await recomputeCourseRating(review.course);
  res.status(201).json({ success: true, review });
});

export const listReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ course: req.params.id }).populate('user', 'name avatar headline').sort('-createdAt');
  res.json({ success: true, reviews });
});

export const updateProgress = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found.');

  const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id, status: { $ne: 'refunded' } });
  if (!enrollment && req.user.role !== 'admin') throw new ApiError(403, 'Please purchase this course to watch lessons.');

  const { lessonId, moduleIndex, lessonIndex, currentTime = 0, duration = 0, completed = false } = req.body;
  const totalLessons = course.curriculum.reduce((total, module) => total + module.lessons.length, 0) || 1;

  let updatedEnrollment = enrollment;
  if (enrollment) {
    const exists = enrollment.completedLessons.some((item) => item.lessonId === lessonId);
    if (completed && !exists) {
      enrollment.completedLessons.push({ lessonId, completedAt: new Date() });
    }
    enrollment.lastWatched = { lessonId, moduleIndex, lessonIndex, currentTime, updatedAt: new Date() };
    enrollment.progressPercent = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
    if (enrollment.progressPercent >= 100) enrollment.status = 'completed';
    updatedEnrollment = await enrollment.save();
  }

  await WatchHistory.findOneAndUpdate(
    { user: req.user._id, course: course._id, lessonId },
    { moduleIndex, lessonIndex, currentTime, duration, completed },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, enrollment: updatedEnrollment });
});

export const getProgress = asyncHandler(async (req, res) => {
  const [enrollment, history] = await Promise.all([
    Enrollment.findOne({ user: req.user._id, course: req.params.id, status: { $ne: 'refunded' } }),
    WatchHistory.find({ user: req.user._id, course: req.params.id }).sort('-updatedAt')
  ]);

  res.json({ success: true, enrollment, history });
});
