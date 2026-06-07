import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const fallback = (feature, input) => {
  const title = input.title || input.topic || input.lessonTitle || 'this lesson';
  if (feature === 'quiz') {
    return {
      title: `Practice quiz: ${title}`,
      questions: Array.from({ length: Number(input.count) || 10 }, (_, index) => ({
        question: `Checkpoint ${index + 1}: What should you understand about ${title}?`,
        options: ['The main concept and use case', 'Only the definition', 'Only the video length', 'Nothing practical'],
        answer: 'The main concept and use case',
        explanation: 'Strong learning means connecting the concept with practical use.'
      }))
    };
  }

  if (feature === 'curriculum') {
    return Array.from({ length: 5 }, (_, moduleIndex) => ({
      title: `Module ${moduleIndex + 1}: ${title} checkpoint`,
      lessons: Array.from({ length: 3 }, (_, lessonIndex) => ({
        title: `Lesson ${lessonIndex + 1}: ${lessonIndex === 0 ? 'Concept' : lessonIndex === 1 ? 'Practice' : 'Review'} for ${title}`,
        videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
        duration: ['10 min', '12 min', '8 min'][lessonIndex],
        isPreview: moduleIndex === 0 && lessonIndex === 0
      }))
    }));
  }

  if (feature === 'course-details') {
    const category = input.category || 'Course';
    return {
      subtitle: `Learn ${title} with a clear, project-first path.`,
      outcomes: [
        `Understand the core concepts in ${title}`,
        'Practice through guided lessons',
        'Build confidence with real learning checkpoints',
        'Prepare for the next step in your learning path'
      ],
      requirements: ['Basic computer skills', 'A willingness to practice lesson by lesson'],
      tags: [category, title.split(' ')[0], input.level || 'Beginner'].filter(Boolean)
    };
  }

  if (feature === 'quiz-report') {
    return {
      summary: input.score >= 75 ? 'Strong performance. Continue to the next module.' : 'Needs revision. Rewatch this module before moving ahead.',
      strengths: ['Understands the main ideas', 'Can identify core checkpoints'],
      improvements: input.score >= 75 ? ['Practice with one real example'] : ['Rewatch lessons', 'Retake notes', 'Try the quiz again after revision'],
      recommendation: input.score >= 75 ? 'continue' : 'rewatch'
    };
  }

  if (feature === 'course-recommendations') {
    const available = input.availableCourses || [];
    return available.slice(0, 4).map((course, index) => ({
      courseId: course._id?.toString?.() || course._id || '',
      title: course.title,
      reason:
        index === 0
          ? `Best next step after ${input.enrolledTitles?.[0] || 'your current learning path'}.`
          : 'Matches your current skills and helps build a stronger path.',
      priority: index + 1,
      fit: index === 0 ? 'High' : 'Good'
    }));
  }

  if (feature === 'notes') {
    return `# Notes for ${title}\n\n- Start with the core objective.\n- Capture definitions, examples, and mistakes to avoid.\n- End with one small project or exercise.\n\nAction item: write a 5-minute recap in your own words.`;
  }

  if (feature === 'summary') {
    return `${title} focuses on the key concepts, practical steps, and checkpoints a learner should understand before moving forward. Review the examples, test yourself, and mark the lesson complete once you can explain it simply.`;
  }

  return `I can help with ${title}. Break the problem into: what you know, what is confusing, one example, and the next action. Ask me the exact doubt and I will reason through it step by step.`;
};

const model = () => {
  if (!env.geminiApiKey) {
    if (env.isProduction) throw new ApiError(500, 'Gemini API key is not configured.');
    return null;
  }
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  return genAI.getGenerativeModel({ model: env.geminiModel });
};

export const generateAIResponse = async ({ feature, prompt, input = {} }) => {
  const gemini = model();
  if (!gemini) return fallback(feature, input);

  const result = await gemini.generateContent(prompt);
  const text = result.response.text();

  if (!['quiz', 'curriculum', 'quiz-report', 'course-recommendations', 'course-details'].includes(feature)) return text;

  const sanitized = text.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(sanitized);
    if (feature === 'curriculum') {
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed.modules)) return parsed.modules;
      return fallback(feature, input);
    }
    if (feature === 'course-details') {
      return {
        subtitle: parsed.subtitle || fallback(feature, input).subtitle,
        outcomes: Array.isArray(parsed.outcomes) ? parsed.outcomes : fallback(feature, input).outcomes,
        requirements: Array.isArray(parsed.requirements) ? parsed.requirements : fallback(feature, input).requirements,
        tags: Array.isArray(parsed.tags) ? parsed.tags : fallback(feature, input).tags
      };
    }
    return parsed;
  } catch {
    if (feature === 'curriculum') return fallback(feature, input);
    if (feature === 'course-details') return fallback(feature, input);
    return {
      title: input.topic || 'Generated quiz',
      raw: text
    };
  }
};
