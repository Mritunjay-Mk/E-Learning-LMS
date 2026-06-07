export const sampleCourses = [
  {
    _id: 'seed-mern',
    title: 'MERN Stack Mastery with AI Projects',
    slug: 'mern-stack-mastery-with-ai-projects',
    subtitle: 'Build production SaaS apps with React, Node, MongoDB, Razorpay, and Gemini.',
    description: 'A complete project-driven path for learners who want to ship real products.',
    category: { name: 'Full Stack' },
    level: 'Intermediate',
    price: 3999,
    discountPrice: 2499,
    duration: '18 hours',
    studentsCount: 12840,
    ratingAverage: 4.8,
    ratingCount: 920,
    thumbnailUrl: 'https://img.youtube.com/vi/7CqJlxBYj-M/maxresdefault.jpg',
    coverImage: 'https://img.youtube.com/vi/7CqJlxBYj-M/maxresdefault.jpg'
  },
  {
    _id: 'seed-ai',
    title: 'Gemini AI Tutor Builder',
    slug: 'gemini-ai-tutor-builder',
    subtitle: 'Design chat, notes, lesson summaries, and quiz generation for education apps.',
    description: 'Learn prompt design, JSON generation, and student support UX.',
    category: { name: 'AI Engineering' },
    level: 'Beginner',
    price: 2999,
    discountPrice: 1799,
    duration: '9 hours',
    studentsCount: 8740,
    ratingAverage: 4.9,
    ratingCount: 690,
    thumbnailUrl: 'https://img.youtube.com/vi/JMUxmLyrhSk/maxresdefault.jpg',
    coverImage: 'https://img.youtube.com/vi/JMUxmLyrhSk/maxresdefault.jpg'
  },
  {
    _id: 'seed-dashboard',
    title: 'Data Dashboards for LMS Analytics',
    slug: 'data-dashboards-for-lms-analytics',
    subtitle: 'Track revenue, progress, engagement, and AI usage with clean dashboard UX.',
    description: 'Build measurable learning and revenue dashboards.',
    category: { name: 'Data Skills' },
    level: 'Intermediate',
    price: 1999,
    discountPrice: 1299,
    duration: '7 hours',
    studentsCount: 5320,
    ratingAverage: 4.7,
    ratingCount: 330,
    thumbnailUrl: 'https://img.youtube.com/vi/rg7Fvvl3taU/maxresdefault.jpg',
    coverImage: 'https://img.youtube.com/vi/rg7Fvvl3taU/maxresdefault.jpg'
  }
];

export const faqItems = [
  {
    question: 'How does course access work?',
    answer: 'Students purchase a course through Razorpay, the backend verifies the payment signature, and enrollment is created automatically.'
  },
  {
    question: 'When is library access free?',
    answer: 'Any paid or free course enrollment unlocks the PDF library. Students without a course can buy a separate library pass.'
  },
  {
    question: 'What can the AI tutor do?',
    answer: 'It can answer doubts, generate notes, summarize lessons, and create quizzes through the Gemini API.'
  },
  {
    question: 'Can admins manage content?',
    answer: 'Admins can manage courses, categories, PDF books, users, payments, and analytics from the admin dashboard.'
  }
];
