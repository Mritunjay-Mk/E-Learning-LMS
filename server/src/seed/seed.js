import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import AiUsage from '../models/AiUsage.js';
import Book from '../models/Book.js';
import Category from '../models/Category.js';
import ContactMessage from '../models/ContactMessage.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import WatchHistory from '../models/WatchHistory.js';

const categories = [
  { name: 'Full Stack', description: 'Production web development from interface to API.', color: '#5b7cfa' },
  { name: 'AI Engineering', description: 'Build with LLMs, prompts, and automation.', color: '#12b886' },
  { name: 'Data Skills', description: 'Analytics, dashboards, and decision systems.', color: '#f97316' },
  { name: 'Career Lab', description: 'Portfolio, interview, and workplace skills.', color: '#ec4899' }
];

const courses = [
  {
    title: 'MERN Stack Mastery with AI Projects',
    subtitle: 'Build production-grade SaaS apps with React, Node, MongoDB, and Gemini.',
    description:
      'A complete project-driven path for learners who want to ship real products. You will build authentication, payments, dashboards, AI assistants, and deployment-ready workflows.',
    category: 'Full Stack',
    level: 'Intermediate',
    price: 3999,
    discountPrice: 2499,
    duration: '18 hours',
    previewVideoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
    featured: true,
    tags: ['React', 'Node', 'MongoDB', 'Gemini'],
    outcomes: ['Ship a SaaS LMS', 'Build secure JWT auth', 'Connect payments and AI features'],
    requirements: ['Basic JavaScript', 'HTML and CSS fundamentals'],
    instructor: {
      name: 'Aarav Mehta',
      title: 'Full-stack mentor',
      bio: 'Helps students turn project ideas into deployable software.'
    },
    curriculum: [
      {
        title: 'Foundation and Architecture',
        lessons: [
          { title: 'How modern MERN apps are structured', videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M', duration: '14 min', isPreview: true },
          { title: 'Authentication and protected routes', videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4', duration: '18 min' }
        ]
      },
      {
        title: 'Production Features',
        lessons: [
          { title: 'Payments and purchase access', videoUrl: 'https://www.youtube.com/watch?v=2HBIzEx6IZA', duration: '16 min' },
          { title: 'AI tutor and quiz generation', videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk', duration: '20 min' }
        ]
      }
    ]
  },
  {
    title: 'Gemini AI Tutor Builder',
    subtitle: 'Design chat, notes, lesson summaries, and quiz generation for education apps.',
    description:
      'Learn prompt design, structured JSON generation, AI safety boundaries, and UX patterns for useful student support tools.',
    category: 'AI Engineering',
    level: 'Beginner',
    price: 2999,
    discountPrice: 1799,
    duration: '9 hours',
    previewVideoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
    featured: true,
    tags: ['Gemini', 'Prompts', 'AI Tutor'],
    outcomes: ['Create reliable AI learning flows', 'Generate quizzes and summaries', 'Track AI usage'],
    requirements: ['JavaScript basics'],
    instructor: {
      name: 'Nisha Rao',
      title: 'AI product educator'
    },
    curriculum: [
      {
        title: 'Tutor Systems',
        lessons: [
          { title: 'Prompting for educational support', videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk', duration: '13 min', isPreview: true },
          { title: 'Structured quiz generation', videoUrl: 'https://www.youtube.com/watch?v=3wz6zYbsg1w', duration: '17 min' }
        ]
      }
    ]
  },
  {
    title: 'Data Dashboards for LMS Analytics',
    subtitle: 'Track revenue, progress, engagement, and AI usage with clean dashboard UX.',
    description:
      'A practical analytics course for founders and admins who need measurable learning and revenue dashboards.',
    category: 'Data Skills',
    level: 'Intermediate',
    price: 1999,
    discountPrice: 1299,
    duration: '7 hours',
    previewVideoUrl: 'https://www.youtube.com/watch?v=rg7Fvvl3taU',
    featured: true,
    tags: ['Analytics', 'Charts', 'Admin'],
    outcomes: ['Design analytics cards', 'Build revenue charts', 'Read learner engagement'],
    requirements: ['React basics'],
    instructor: {
      name: 'Kabir Sen',
      title: 'Data product coach'
    },
    curriculum: [
      {
        title: 'Admin Analytics',
        lessons: [
          { title: 'Revenue and engagement metrics', videoUrl: 'https://www.youtube.com/watch?v=rg7Fvvl3taU', duration: '11 min', isPreview: true }
        ]
      }
    ]
  }
];

const books = [
  {
    title: 'The Production MERN Handbook',
    author: 'LearnHub Research',
    category: 'Full Stack',
    description: 'A concise guide to MERN architecture, security, deployment, and maintainable folder structure.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    title: 'AI Study Systems',
    author: 'LearnHub AI Lab',
    category: 'AI Engineering',
    description: 'Patterns for AI tutors, summaries, notes, and quiz tools in learning products.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    featured: true
  }
];

const run = async () => {
  await connectDB();
  await Promise.all([
    AiUsage.deleteMany(),
    Book.deleteMany(),
    Category.deleteMany(),
    ContactMessage.deleteMany(),
    Course.deleteMany(),
    Enrollment.deleteMany(),
    Payment.deleteMany(),
    Review.deleteMany(),
    User.deleteMany(),
    WatchHistory.deleteMany()
  ]);

  const admin = await User.create({
    name: 'LearnHub Admin',
    email: 'admin@learnhub.ai',
    password: 'Admin@12345',
    role: 'admin',
    headline: 'Platform owner'
  });

  const learner = await User.create({
    name: 'Demo Learner',
    email: 'student@learnhub.ai',
    password: 'Student@12345',
    role: 'student'
  });

  const createdCategories = [];
  for (const category of categories) {
    createdCategories.push(await Category.create(category));
  }
  const categoryMap = new Map(createdCategories.map((category) => [category.name, category._id]));

  for (const course of courses) {
    await Course.create({
      ...course,
      category: categoryMap.get(course.category)
    });
  }

  await Book.insertMany(books.map((book) => ({ ...book, uploadedBy: admin._id })));

  console.log('Seed complete');
  console.log('Admin: admin@learnhub.ai / Admin@12345');
  console.log('Student: student@learnhub.ai / Student@12345');
  console.log(`Learner id: ${learner._id}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
