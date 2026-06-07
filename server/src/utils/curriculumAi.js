import { generateAIResponse } from '../services/aiService.js';

export const looksLikeDefaultCurriculum = (curriculum = []) => {
  if (!Array.isArray(curriculum) || curriculum.length === 0) return true;
  if (curriculum.length > 1) return false;

  const [module] = curriculum;
  const lessons = module?.lessons || [];
  const moduleTitle = (module?.title || '').trim().toLowerCase();
  const lessonTitle = (lessons[0]?.title || '').trim().toLowerCase();

  return lessons.length <= 1 && (moduleTitle === 'module 1' || moduleTitle.endsWith('module 1')) && (!lessonTitle || lessonTitle === 'introduction');
};

export const generateCourseCurriculum = async ({ title, description, level }) => {
  const prompt = `
Create a complete LMS course curriculum as JSON only.
Return an array of small modules.
Each module must be around 30 to 45 minutes total.
Each module must have 3 to 4 lessons.
Each lesson must be 8 to 15 minutes and include title, videoUrl, duration, isPreview.
Use this placeholder videoUrl when no exact URL is known: https://www.youtube.com/watch?v=7CqJlxBYj-M
Design the modules so a quiz can run after every module.
Course title: ${title}
Description: ${description}
Level: ${level || 'Beginner'}
`;

  const curriculum = await generateAIResponse({
    feature: 'curriculum',
    prompt,
    input: { title }
  });

  return Array.isArray(curriculum) ? curriculum : [];
};

export const generateCourseDetails = async ({ title, description, level, category }) => {
  const prompt = `
Create LMS course detail metadata as JSON only.
Return exactly: subtitle, outcomes, requirements, tags.
subtitle must be under 120 characters.
outcomes must be 4 practical learner outcomes.
requirements must be 2 to 4 short prerequisites.
tags must be 3 to 6 searchable tags.
Course title: ${title}
Description: ${description}
Level: ${level || 'Beginner'}
Category: ${category || 'Course'}
`;

  return generateAIResponse({
    feature: 'course-details',
    prompt,
    input: { title, description, level, category }
  });
};

export const ensureAiCourseDetails = async (payload) => {
  if (!payload.title || !payload.description) return payload;

  const needsSubtitle = !payload.subtitle;
  const needsOutcomes = !Array.isArray(payload.outcomes) || payload.outcomes.length === 0;
  const needsRequirements = !Array.isArray(payload.requirements) || payload.requirements.length === 0;
  const needsTags = !Array.isArray(payload.tags) || payload.tags.length === 0;

  if (!needsSubtitle && !needsOutcomes && !needsRequirements && !needsTags) return payload;

  const details = await generateCourseDetails(payload);
  if (needsSubtitle && details.subtitle) payload.subtitle = details.subtitle;
  if (needsOutcomes && Array.isArray(details.outcomes)) payload.outcomes = details.outcomes;
  if (needsRequirements && Array.isArray(details.requirements)) payload.requirements = details.requirements;
  if (needsTags && Array.isArray(details.tags)) payload.tags = details.tags;
  return payload;
};

export const ensureAiCurriculum = async (payload) => {
  if (!looksLikeDefaultCurriculum(payload.curriculum)) return payload;
  const curriculum = await generateCourseCurriculum(payload);
  if (curriculum.length) payload.curriculum = curriculum;
  return payload;
};
