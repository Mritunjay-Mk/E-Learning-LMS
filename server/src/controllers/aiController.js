import { body } from 'express-validator';
import AiUsage from '../models/AiUsage.js';
import Course from '../models/Course.js';
import { generateAIResponse } from '../services/aiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const saveUsage = async ({ req, feature, response }) => {
  await AiUsage.create({
    user: req.user._id,
    course: req.body.courseId || undefined,
    feature,
    promptTokens: JSON.stringify(req.body).length,
    responseLength: typeof response === 'string' ? response.length : JSON.stringify(response).length
  });
};

export const aiTextRule = [body('message').optional().trim().isLength({ min: 2 })];

export const tutorChat = asyncHandler(async (req, res) => {
  let courseContext = '';
  if (req.body.courseId) {
    const course = await Course.findById(req.body.courseId).select('title description curriculum');
    courseContext = course ? `Course context: ${course.title}. ${course.description}` : '';
  }

  const prompt = `
You are LearnHub AI Tutor, a precise and encouraging LMS assistant.
Keep the answer short and easy to scan.
Default to 4-6 bullet points or under 120 words.
Give a longer answer only if the student clearly asks for detail.
Use one tiny example only when it helps.
${courseContext}
Lesson context: ${req.body.lessonContext || 'General learning support'}
Student question: ${req.body.message}
`;

  const response = await generateAIResponse({
    feature: 'tutor',
    prompt,
    input: { title: req.body.lessonContext || req.body.message }
  });
  await saveUsage({ req, feature: 'tutor', response });
  res.json({ success: true, response });
});

export const generateSummary = asyncHandler(async (req, res) => {
  const prompt = `
Summarize this lesson for an LMS student.
Return a compact summary, key takeaways, and 3 revision checkpoints.
Title: ${req.body.title}
Transcript or notes: ${req.body.transcript || req.body.content || ''}
`;
  const response = await generateAIResponse({
    feature: 'summary',
    prompt,
    input: { title: req.body.title }
  });
  await saveUsage({ req, feature: 'summary', response });
  res.json({ success: true, summary: response });
});

export const generateNotes = asyncHandler(async (req, res) => {
  const prompt = `
Create clean markdown study notes for the lesson below.
Include headings, bullet points, examples, mistakes to avoid, and practice actions.
Lesson: ${req.body.lessonTitle}
Content: ${req.body.transcript || req.body.content || ''}
`;
  const response = await generateAIResponse({
    feature: 'notes',
    prompt,
    input: { lessonTitle: req.body.lessonTitle }
  });
  await saveUsage({ req, feature: 'notes', response });
  res.json({ success: true, notes: response });
});

export const generateQuiz = asyncHandler(async (req, res) => {
  const prompt = `
Generate a JSON quiz for an LMS.
Return only JSON with: title, questions[].
Each question must include question, options[4], answer, explanation.
Topic: ${req.body.topic}
Difficulty: ${req.body.difficulty || 'mixed'}
Number of questions: ${Number(req.body.count) || 5}
`;
  const response = await generateAIResponse({
    feature: 'quiz',
    prompt,
    input: { topic: req.body.topic }
  });
  await saveUsage({ req, feature: 'quiz', response });
  res.json({ success: true, quiz: response });
});
