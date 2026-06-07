import Course from '../models/Course.js';
import CourseRequest from '../models/CourseRequest.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureAiCurriculum } from '../utils/curriculumAi.js';

const educatorInstructor = (educator) => ({
  name: educator.name,
  title: educator.headline || `${educator.educatorSubject || 'Course'} educator`,
  avatar: educator.avatar || '',
  bio: educator.bio || ''
});

export const createCourseRequest = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  await ensureAiCurriculum(payload);

  const request = await CourseRequest.create({
    educator: req.user._id,
    payload,
    status: 'pending'
  });

  res.status(201).json({ success: true, request });
});

export const listCourseRequests = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { educator: req.user._id };
  const requests = await CourseRequest.find(filter)
    .populate('educator', 'name email educatorSubject headline avatar bio')
    .populate('course', 'title slug')
    .populate('reviewedBy', 'name email')
    .sort('-createdAt');

  res.json({ success: true, requests });
});

export const reviewCourseRequest = asyncHandler(async (req, res) => {
  const { status, adminNote = '' } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Review status must be approved or rejected.');
  }

  const request = await CourseRequest.findById(req.params.id).populate('educator', 'name email educatorSubject headline avatar bio');
  if (!request) throw new ApiError(404, 'Course request not found.');
  if (request.status !== 'pending') throw new ApiError(409, 'This request is already reviewed.');

  request.status = status;
  request.adminNote = adminNote;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();

  if (status === 'approved') {
    await ensureAiCurriculum(request.payload);
    const course = await Course.create({
      ...request.payload,
      instructorOwner: request.educator._id,
      instructor: educatorInstructor(request.educator)
    });
    request.course = course._id;
  }

  await request.save();
  res.json({ success: true, request });
});
