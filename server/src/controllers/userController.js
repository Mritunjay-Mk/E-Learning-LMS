import AiUsage from '../models/AiUsage.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import WatchHistory from '../models/WatchHistory.js';
import { generateAIResponse } from '../services/aiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboard = asyncHandler(async (req, res) => {
  const [enrollments, payments, history] = await Promise.all([
    Enrollment.find({ user: req.user._id }).populate('course').sort('-updatedAt'),
    Payment.find({ user: req.user._id }).populate('course', 'title slug').sort('-createdAt').limit(6),
    WatchHistory.find({ user: req.user._id }).populate('course', 'title slug thumbnailUrl').sort('-updatedAt').limit(8)
  ]);

  const completed = enrollments.filter((item) => item.status === 'completed').length;
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((total, item) => total + item.progressPercent, 0) / enrollments.length)
    : 0;

  res.json({
    success: true,
    dashboard: {
      enrollments,
      payments,
      history,
      stats: {
        enrolled: enrollments.length,
        completed,
        avgProgress,
        libraryAccess: req.user.libraryAccess || enrollments.length > 0
      }
    }
  });
});

export const recommendations = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id }).populate({
    path: 'course',
    populate: 'category'
  });
  const enrolledCourseIds = enrollments.map((item) => item.course?._id).filter(Boolean);
  const availableCourses = await Course.find({
    status: 'published',
    _id: { $nin: enrolledCourseIds }
  })
    .populate('category')
    .sort('-featured -studentsCount -ratingAverage')
    .limit(20);

  if (!availableCourses.length) {
    return res.json({ success: true, recommendations: [] });
  }

  const enrolledSummary = enrollments.map((item) => ({
    title: item.course?.title,
    category: item.course?.category?.name,
    level: item.course?.level,
    progress: item.progressPercent
  }));
  const availableSummary = availableCourses.map((course) => ({
    _id: course._id,
    title: course.title,
    category: course.category?.name,
    level: course.level,
    tags: course.tags,
    description: course.description?.slice(0, 240)
  }));

  const prompt = `
You are an AI course advisor for an LMS.
Recommend the best next courses from the available catalog for this student.
Use their enrolled courses, progress, categories, and skill path.
Example: if HTML is enrolled, CSS and JavaScript should rank high when available.
Return only JSON array with 3 to 5 items.
Each item: courseId, title, reason, priority, fit.
Enrolled courses: ${JSON.stringify(enrolledSummary)}
Available catalog: ${JSON.stringify(availableSummary)}
`;

  const aiRecommendations = await generateAIResponse({
    feature: 'course-recommendations',
    prompt,
    input: {
      enrolledTitles: enrolledSummary.map((course) => course.title).filter(Boolean),
      availableCourses: availableSummary
    }
  });

  await AiUsage.create({
    user: req.user._id,
    feature: 'course-recommendations',
    promptTokens: JSON.stringify({ enrolledSummary, availableSummary }).length,
    responseLength: JSON.stringify(aiRecommendations).length
  });

  const recommendationList = Array.isArray(aiRecommendations) ? aiRecommendations : [];
  const recommendations = recommendationList
    .map((item) => {
      const course = availableCourses.find((candidate) => String(candidate._id) === String(item.courseId));
      if (!course) return null;
      return {
        course,
        reason: item.reason || 'Recommended for your learning path.',
        priority: item.priority || 1,
        fit: item.fit || 'Good'
      };
    })
    .filter(Boolean)
    .slice(0, 5);

  const fallback = availableCourses.slice(0, 4).map((course, index) => ({
    course,
    reason: index === 0 ? 'Best next course based on your current learning path.' : 'A useful follow-up from the available catalog.',
    priority: index + 1,
    fit: index === 0 ? 'High' : 'Good'
  }));

  res.json({ success: true, recommendations: recommendations.length ? recommendations : fallback });
});
