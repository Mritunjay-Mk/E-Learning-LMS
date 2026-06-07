import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const canManageCourse = async (user, courseId) => {
  if (user.role === 'admin') return true;
  const course = await Course.findById(courseId).select('instructorOwner');
  return course && String(course.instructorOwner || '') === String(user._id);
};

export const listAssignments = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'educator') {
    const courses = await Course.find({ instructorOwner: req.user._id }).select('_id');
    filter.course = { $in: courses.map((course) => course._id) };
  }

  if (req.user.role === 'student') {
    const enrollments = await Enrollment.find({ user: req.user._id, status: 'active' }).select('course');
    filter.course = { $in: enrollments.map((enrollment) => enrollment.course) };
  }

  const assignments = await Assignment.find(filter)
    .populate('course', 'title slug')
    .populate('educator', 'name email')
    .populate('submissions.student', 'name email')
    .sort('-createdAt');

  if (['admin', 'educator'].includes(req.user.role)) {
    const courseIds = [...new Set(assignments.map((assignment) => String(assignment.course?._id || assignment.course)))];
    const enrollments = await Enrollment.find({ course: { $in: courseIds }, status: 'active' }).populate('user', 'name email');
    const rosterByCourse = enrollments.reduce((map, enrollment) => {
      const key = String(enrollment.course);
      map[key] = map[key] || [];
      map[key].push(enrollment.user);
      return map;
    }, {});

    return res.json({
      success: true,
      assignments: assignments.map((assignment) => {
        const data = assignment.toObject();
        data.roster = rosterByCourse[String(data.course?._id || data.course)] || [];
        return data;
      })
    });
  }

  res.json({
    success: true,
    assignments: assignments.map((assignment) => {
      const data = assignment.toObject();
      data.submissions = (data.submissions || []).filter((submission) => String(submission.student?._id || submission.student) === String(req.user._id));
      return data;
    })
  });
});

export const createAssignment = asyncHandler(async (req, res) => {
  const { course, title, instructions, dueDate, maxMarks } = req.body;
  if (!(await canManageCourse(req.user, course))) {
    throw new ApiError(403, 'You can create assignments only for assigned courses.');
  }

  const assignment = await Assignment.create({
    course,
    educator: req.user.role === 'educator' ? req.user._id : req.body.educator || req.user._id,
    title,
    instructions,
    dueDate: dueDate || undefined,
    maxMarks: Number(maxMarks || 100)
  });

  res.status(201).json({ success: true, assignment });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new ApiError(404, 'Assignment not found.');

  const enrollment = await Enrollment.findOne({ user: req.user._id, course: assignment.course, status: 'active' });
  if (!enrollment && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only enrolled students can submit this assignment.');
  }

  const existing = assignment.submissions.find((item) => String(item.student) === String(req.user._id));
  if (existing) {
    existing.answer = req.body.answer || '';
    existing.submittedAt = new Date();
    existing.marks = null;
    existing.feedback = '';
    existing.gradedAt = undefined;
    existing.gradedBy = undefined;
  } else {
    assignment.submissions.push({ student: req.user._id, answer: req.body.answer || '', submittedAt: new Date() });
  }

  await assignment.save();
  res.json({ success: true, assignment });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new ApiError(404, 'Assignment not found.');
  if (!(await canManageCourse(req.user, assignment.course))) {
    throw new ApiError(403, 'You can grade assignments only for assigned courses.');
  }

  const submission = assignment.submissions.find((item) => String(item.student) === String(req.params.studentId));
  if (!submission) throw new ApiError(404, 'Submission not found.');

  const marks = Number(req.body.marks);
  if (Number.isNaN(marks) || marks < 0 || marks > assignment.maxMarks) {
    throw new ApiError(400, `Marks must be between 0 and ${assignment.maxMarks}.`);
  }

  submission.marks = marks;
  submission.feedback = req.body.feedback || '';
  submission.gradedAt = new Date();
  submission.gradedBy = req.user._id;

  await assignment.save();
  res.json({ success: true, assignment });
});
