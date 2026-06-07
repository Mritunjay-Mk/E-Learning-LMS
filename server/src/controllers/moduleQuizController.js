import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import ModuleQuiz from '../models/ModuleQuiz.js';
import { generateAIResponse } from '../services/aiService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const ensureCourseAccess = async (req, course) => {
  if (req.user.role === 'admin') return;
  const ownsCourse = String(course.instructorOwner || '') === String(req.user._id);
  if (ownsCourse) return;
  const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id, status: 'active' });
  if (!enrollment) throw new ApiError(403, 'Course access is required.');
};

export const startModuleQuiz = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new ApiError(404, 'Course not found.');
  await ensureCourseAccess(req, course);

  const moduleIndex = Number(req.params.moduleIndex);
  const module = course.curriculum?.[moduleIndex];
  if (!module) throw new ApiError(404, 'Module not found.');

  let moduleQuiz = await ModuleQuiz.findOne({ user: req.user._id, course: course._id, moduleIndex });
  if (!moduleQuiz) {
    const prompt = `
Generate JSON only for a module completion quiz.
Return { "title": string, "questions": [] }.
Create 10 to 15 questions.
Each question must include question, options[4], answer, explanation.
Course: ${course.title}
Module: ${module.title}
Lessons: ${(module.lessons || []).map((lesson) => lesson.title).join(', ')}
`;
    const quiz = await generateAIResponse({
      feature: 'quiz',
      prompt,
      input: { topic: `${course.title} - ${module.title}`, count: 12 }
    });
    moduleQuiz = await ModuleQuiz.create({
      user: req.user._id,
      course: course._id,
      moduleIndex,
      moduleTitle: module.title,
      quiz
    });
  }

  res.json({ success: true, moduleQuiz });
});

export const submitModuleQuiz = asyncHandler(async (req, res) => {
  const moduleQuiz = await ModuleQuiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!moduleQuiz) throw new ApiError(404, 'Module quiz not found.');

  const answers = req.body.answers || [];
  const questions = moduleQuiz.quiz?.questions || [];
  const correctCount = questions.reduce((count, question, index) => count + (answers[index] === question.answer ? 1 : 0), 0);
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const report = await generateAIResponse({
    feature: 'quiz-report',
    prompt: `
Return JSON only with summary, strengths[], improvements[], recommendation.
Recommendation must be continue or rewatch.
Score: ${score}
Correct: ${correctCount}/${questions.length}
Module: ${moduleQuiz.moduleTitle}
Wrong answers: ${questions
      .map((question, index) => (answers[index] === question.answer ? '' : `${question.question} | selected ${answers[index] || 'blank'} | correct ${question.answer}`))
      .filter(Boolean)
      .join('\n')}
`,
    input: { score, title: moduleQuiz.moduleTitle }
  });

  moduleQuiz.answers = answers;
  moduleQuiz.correctCount = correctCount;
  moduleQuiz.score = score;
  moduleQuiz.report = report;
  moduleQuiz.submittedAt = new Date();
  await moduleQuiz.save();

  res.json({ success: true, moduleQuiz });
});

export const listModuleQuizReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'educator') {
    const courses = await Course.find({ instructorOwner: req.user._id }).select('_id');
    filter.course = { $in: courses.map((course) => course._id) };
  } else if (req.user.role === 'student') {
    filter.user = req.user._id;
  }

  const reports = await ModuleQuiz.find(filter)
    .populate('user', 'name email')
    .populate('course', 'title slug instructorOwner')
    .sort('-updatedAt');

  res.json({ success: true, reports });
});
