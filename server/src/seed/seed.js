import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import AiUsage from '../models/AiUsage.js';
import Book from '../models/Book.js';
import Category from '../models/Category.js';
import ContactMessage from '../models/ContactMessage.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Faq from '../models/Faq.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Testimonial from '../models/Testimonial.js';
import User from '../models/User.js';
import WatchHistory from '../models/WatchHistory.js';

const categories = [
  {
    name: 'Full Stack Development',
    description: 'Master frontend, backend, databases, and deployment with production architectures.',
    color: '#3b82f6'
  },
  {
    name: 'Generative AI & LLMs',
    description: 'Build intelligent applications, agents, and custom fine-tuned workflows.',
    color: '#10b981'
  },
  {
    name: 'Cloud & DevOps',
    description: 'Docker, Kubernetes, CI/CD pipelines, and enterprise cloud infrastructure.',
    color: '#f59e0b'
  },
  {
    name: 'System Design & DSA',
    description: 'High-scalability architecture, algorithms, and high-frequency interview preparation.',
    color: '#8b5cf6'
  },
  {
    name: 'Data Science & Python',
    description: 'Analytics, data engineering, statistical modeling, and machine learning pipelines.',
    color: '#ec4899'
  }
];

const faqs = [
  {
    category: 'General',
    order: 1,
    question: 'How does LearnHub Academy differ from generic video platforms?',
    answer:
      'LearnHub Academy combines structured, project-driven video curriculum with an integrated 24/7 AI tutor, real-world portfolio projects, mentor code reviews, and gated PDF learning material. You don’t just watch videos—you build production-grade software with instant doubt resolution.'
  },
  {
    category: 'General',
    order: 2,
    question: 'Do I get lifetime access to the courses I enroll in?',
    answer:
      'Yes! Once enrolled, you enjoy lifetime unlimited access to all course modules, videos, coding exercises, downloadable resources, and future curriculum updates at no recurring charge.'
  },
  {
    category: 'Courses',
    order: 3,
    question: 'Are the projects suitable for adding to my professional resume and GitHub?',
    answer:
      'Absolutely. Every capstone project is designed around real production architecture—including authentication, database indexing, rate-limiting, and deployment—giving you impressive GitHub repositories that stand out to tech hiring managers.'
  },
  {
    category: 'Courses',
    order: 4,
    question: 'Can I ask questions if I get stuck while coding a lesson?',
    answer:
      'Yes! Each lesson has an integrated AI Tutor panel trained specifically on the lesson context to provide instant debugging, concept explanations, and syntax examples. Furthermore, course instructors and community mentors are available in the course forums.'
  },
  {
    category: 'Payments & Billing',
    order: 5,
    question: 'What payment methods are supported?',
    answer:
      'We accept all major UPI apps (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), Netbanking, and popular digital wallets via our secure Razorpay gateway.'
  },
  {
    category: 'Payments & Billing',
    order: 6,
    question: 'Is there a refund policy if I am not satisfied?',
    answer:
      'We offer a 7-day no-questions-asked refund policy if you have completed less than 25% of the course curriculum and haven’t downloaded the premium certification.'
  },
  {
    category: 'AI Tutor',
    order: 7,
    question: 'How does the Gemini AI Tutor assist my daily learning?',
    answer:
      'The AI Tutor is context-aware: it understands the exact video timestamp and topic you are learning. You can ask for code reviews, simplified analogies, practice quizzes, and lesson summaries on demand.'
  },
  {
    category: 'Certificates',
    order: 8,
    question: 'Will I receive a verifiable certificate upon completion?',
    answer:
      'Yes, once you complete all video lessons and pass the final module quizzes with 75% or higher, you are awarded an industry-recognized LearnHub Academy certificate with a verifiable digital credential link for LinkedIn.'
  }
];

const testimonials = [
  {
    name: 'Aman Srivastava',
    role: 'Frontend Engineer',
    company: 'Razorpay',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    rating: 5,
    courseName: 'Full-Stack MERN Architecture',
    content:
      'The practical approach here is night and day compared to generic tutorial sites. Building real authentication, payment webhooks, and AI assistants gave me the exact skills I was asked in my senior engineering interviews.'
  },
  {
    name: 'Pooja Verma',
    role: 'AI / ML Developer',
    company: 'Flipkart',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
    rating: 5,
    courseName: 'Practical Generative AI & LLMs',
    content:
      'The Generative AI course demystified LLM orchestration, embeddings, and prompt engineering. The AI tutor built into the player is a game changer whenever you hit a roadblock.'
  },
  {
    name: 'Rohan Deshmukh',
    role: 'DevOps Specialist',
    company: 'Swiggy',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    rating: 5,
    courseName: 'Cloud DevOps & Kubernetes',
    content:
      'I transitioned from manual system administration to modern cloud DevOps in under four months thanks to the Kubernetes and CI/CD modules. Highly recommended for working professionals.'
  },
  {
    name: 'Neha Singhania',
    role: 'Full Stack Consultant',
    company: 'Infosys Tech',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
    rating: 5,
    courseName: 'System Design & DSA',
    content:
      'Clear, concise, and straight to the point. The interactive curriculum and progress tracking helped me stay consistent even with a demanding full-time job.'
  }
];

const courses = [
  {
    title: 'Full-Stack MERN Architecture with Production Microservices',
    subtitle: 'Build scalable SaaS platforms with React 18, Node.js, Express, MongoDB Atlas, and Redis caching.',
    description:
      'A comprehensive, project-first journey for engineers who want to build and ship real-world software. You will master JWT authentication, payment webhooks, schema optimizations, file uploads, automated CI/CD deployments, and responsive UI with Tailwind CSS.',
    category: 'Full Stack Development',
    level: 'Intermediate',
    price: 4999,
    discountPrice: 2999,
    duration: '22 hours',
    previewVideoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
    featured: true,
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind', 'Microservices'],
    outcomes: [
      'Architect production-grade MERN web applications from scratch',
      'Implement secure JWT tokens with refresh rotation and cookie sanitization',
      'Integrate payment gateways with backend webhook validation',
      'Deploy full-stack applications with production environment configs'
    ],
    requirements: [
      'Fundamental understanding of JavaScript (ES6+)',
      'Basic familiarity with HTML, CSS, and web browser dev tools',
      'Eagerness to build real software hands-on'
    ],
    instructor: {
      name: 'Vikram Sharma',
      title: 'Principal Software Architect',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: '12+ years building high-throughput web applications and mentoring 30,000+ developers globally.'
    },
    curriculum: [
      {
        title: 'Modern Architecture & Setup',
        lessons: [
          {
            title: 'Modern Full-Stack Architecture Deep Dive',
            videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
            duration: '18 min',
            isPreview: true
          },
          {
            title: 'Setting up Node.js REST API with Mongoose and Validation',
            videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
            duration: '24 min'
          },
          {
            title: 'Configuring React + Vite with Clean Component Design',
            videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
            duration: '20 min'
          }
        ]
      },
      {
        title: 'Enterprise Authentication & Security',
        lessons: [
          {
            title: 'JWT Authentication, Refresh Tokens & Role-Based Access Control',
            videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
            duration: '26 min'
          },
          {
            title: 'Input Sanitization, Rate Limiting & Helmet Security Policies',
            videoUrl: 'https://www.youtube.com/watch?v=2HBIzEx6IZA',
            duration: '19 min'
          }
        ]
      },
      {
        title: 'Payment Integration & Cloud Media',
        lessons: [
          {
            title: 'Razorpay UPI & Card Checkout with Backend Cryptographic Signatures',
            videoUrl: 'https://www.youtube.com/watch?v=2HBIzEx6IZA',
            duration: '28 min'
          },
          {
            title: 'Cloudinary Multi-Part File Uploads with Multer',
            videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
            duration: '22 min'
          }
        ]
      }
    ]
  },
  {
    title: 'Practical Generative AI & LLM Applications with Python',
    subtitle: 'Build intelligent AI agents, RAG document search, and custom tutors with Gemini API and LangChain.',
    description:
      'Learn how to harness Large Language Models to solve real product challenges. We cover prompt engineering, structured JSON generation, vector embeddings, retrieval-augmented generation (RAG), and agentic workflows.',
    category: 'Generative AI & LLMs',
    level: 'Beginner',
    price: 3999,
    discountPrice: 2199,
    duration: '14 hours',
    previewVideoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
    featured: true,
    tags: ['Generative AI', 'Gemini API', 'LangChain', 'Python', 'Embeddings', 'RAG'],
    outcomes: [
      'Master prompt engineering and structured schema outputs',
      'Build a context-aware AI tutor with conversation history',
      'Create automated quiz and notes generators',
      'Deploy AI services with token tracking and rate management'
    ],
    requirements: ['Basic Python or JavaScript experience', 'No prior machine learning background needed'],
    instructor: {
      name: 'Dr. Sneha Roy',
      title: 'AI Research Scientist & Author',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      bio: 'Pioneered conversational AI systems and has helped over 25,000 developers adopt LLMs in production.'
    },
    curriculum: [
      {
        title: 'LLM Foundations & API Mastery',
        lessons: [
          {
            title: 'Introduction to Generative Models & LLM APIs',
            videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
            duration: '16 min',
            isPreview: true
          },
          {
            title: 'Prompt Engineering Patterns: Few-Shot, CoT & System Instructions',
            videoUrl: 'https://www.youtube.com/watch?v=3wz6zYbsg1w',
            duration: '22 min'
          }
        ]
      },
      {
        title: 'Structured Output & Production Agents',
        lessons: [
          {
            title: 'Enforcing Strict JSON Schemas for Quizzes & Summaries',
            videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
            duration: '25 min'
          },
          {
            title: 'Building Interactive Educational Assistants',
            videoUrl: 'https://www.youtube.com/watch?v=3wz6zYbsg1w',
            duration: '20 min'
          }
        ]
      }
    ]
  },
  {
    title: 'Cloud DevOps & Kubernetes for Modern Web Apps',
    subtitle: 'Containerization, Docker Compose, Kubernetes clusters, and GitHub Actions CI/CD pipelines.',
    description:
      'Step into the shoes of a DevOps architect. Learn containerization from first principles, deploy multi-container microservices on local and cloud clusters, manage ingress and TLS certificates, and automate zero-downtime rollouts.',
    category: 'Cloud & DevOps',
    level: 'Intermediate',
    price: 3499,
    discountPrice: 1999,
    duration: '16 hours',
    previewVideoUrl: 'https://www.youtube.com/watch?v=rg7Fvvl3taU',
    featured: true,
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Cloud', 'Nginx'],
    outcomes: [
      'Write optimized Dockerfiles and orchestrate multi-container services',
      'Manage Kubernetes Pods, Deployments, Services, and ConfigMaps',
      'Configure end-to-end GitHub Actions pipelines with lint, test, and build',
      'Monitor cluster health, log streams, and high availability metrics'
    ],
    requirements: ['Comfortable using the command line / terminal', 'Basic web application knowledge'],
    instructor: {
      name: 'Rajesh Patel',
      title: 'Lead Cloud Architect',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'AWS & Kubernetes certified architect who has designed scalable cloud systems for Fortune 500 enterprises.'
    },
    curriculum: [
      {
        title: 'Containers & Docker Fundamentals',
        lessons: [
          {
            title: 'Why Containers? Docker Architecture Demystified',
            videoUrl: 'https://www.youtube.com/watch?v=rg7Fvvl3taU',
            duration: '17 min',
            isPreview: true
          },
          {
            title: 'Building Production-Ready Multi-Stage Dockerfiles',
            videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
            duration: '23 min'
          }
        ]
      },
      {
        title: 'Kubernetes & Production Orchestration',
        lessons: [
          {
            title: 'Kubernetes Architecture: Control Plane & Worker Nodes',
            videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
            duration: '27 min'
          },
          {
            title: 'Zero-Downtime Rolling Updates & Ingress Traffic Routing',
            videoUrl: 'https://www.youtube.com/watch?v=2HBIzEx6IZA',
            duration: '21 min'
          }
        ]
      }
    ]
  },
  {
    title: 'Data Structures, Algorithms & System Design for Tech Interviews',
    subtitle: 'Crack FAANG and top-tier tech interviews with high-level design patterns and algorithmic mastery.',
    description:
      'Crack high-bar technical interviews with confidence. Master tree and graph traversals, dynamic programming paradigms, rate limiter design, URL shorteners, distributed caching with Redis, and message queues with Kafka.',
    category: 'System Design & DSA',
    level: 'Advanced',
    price: 4499,
    discountPrice: 2699,
    duration: '25 hours',
    previewVideoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
    featured: true,
    tags: ['System Design', 'Algorithms', 'DSA', 'Redis', 'Kafka', 'Interviews'],
    outcomes: [
      'Deconstruct complex system design interview problems step-by-step',
      'Architect distributed caches, CDNs, and database sharding schemes',
      'Solve medium-to-hard LeetCode algorithmic challenges methodically',
      'Present design trade-offs articulately to engineering interviewers'
    ],
    requirements: ['Intermediate coding proficiency in any language (Java, JS, Python, C++)'],
    instructor: {
      name: 'Rohan Sen',
      title: 'Ex-Staff Engineer & Mentor',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      bio: 'Conducted 300+ technical interviews across Silicon Valley tech leaders and mentored thousands of candidates.'
    },
    curriculum: [
      {
        title: 'System Design Core Principles',
        lessons: [
          {
            title: 'Horizontal vs Vertical Scaling & Load Balancing Strategies',
            videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
            duration: '24 min',
            isPreview: true
          },
          {
            title: 'CAP Theorem, ACID vs BASE, and Database Partitioning',
            videoUrl: 'https://www.youtube.com/watch?v=2HBIzEx6IZA',
            duration: '28 min'
          }
        ]
      },
      {
        title: 'High-Volume Practical Designs',
        lessons: [
          {
            title: 'Designing a Scalable Rate Limiter with Token Bucket Algorithm',
            videoUrl: 'https://www.youtube.com/watch?v=rg7Fvvl3taU',
            duration: '25 min'
          },
          {
            title: 'Designing a Distributed Notification System with Message Queues',
            videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
            duration: '30 min'
          }
        ]
      }
    ]
  },
  {
    title: 'Complete Python for Data Science & Machine Learning',
    subtitle: 'From NumPy and Pandas to exploratory data analysis, Scikit-Learn models, and interactive dashboards.',
    description:
      'The definitive Python data science program. Master data wrangling with Pandas, clean visualization with Seaborn and Plotly, feature engineering, classification and regression models, and building interactive web dashboards with Streamlit.',
    category: 'Data Science & Python',
    level: 'Beginner',
    price: 3299,
    discountPrice: 1899,
    duration: '18 hours',
    previewVideoUrl: 'https://www.youtube.com/watch?v=rg7Fvvl3taU',
    featured: false,
    tags: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Data Analysis', 'Scikit-Learn'],
    outcomes: [
      'Wrangle messy real-world datasets with Pandas and NumPy',
      'Build statistical visualizations and interactive analytics charts',
      'Train, evaluate, and tune supervised machine learning models',
      'Build and publish data science portfolio projects'
    ],
    requirements: ['No prior programming experience required; we start from scratch'],
    instructor: {
      name: 'Priyanshu Verma',
      title: 'Senior Data Scientist',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      bio: 'Transforms complex machine learning models into intuitive, practical engineering solutions.'
    },
    curriculum: [
      {
        title: 'Python & Data Analysis Essentials',
        lessons: [
          {
            title: 'Python for Data Science: Environment Setup & Core Syntax',
            videoUrl: 'https://www.youtube.com/watch?v=rg7Fvvl3taU',
            duration: '15 min',
            isPreview: true
          },
          {
            title: 'Data Cleaning & Transformation with Pandas DataFrames',
            videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
            duration: '25 min'
          }
        ]
      }
    ]
  }
];

const books = [
  {
    title: 'The Production Web Engineering Handbook',
    author: 'Vikram Sharma & Engineering Team',
    category: 'Full Stack Development',
    description:
      'A field guide to modern full-stack architecture, database indexing, caching strategies, zero-trust security, and real-world deployment patterns.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    title: 'Generative AI & LLM Engineering in Practice',
    author: 'Dr. Sneha Roy',
    category: 'Generative AI & LLMs',
    description:
      'Architectural blueprints for integrating LLMs into modern web apps: prompt design, vector embeddings, RAG architectures, and evaluation frameworks.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    featured: true
  },
  {
    title: 'Cloud Native & Kubernetes Deployment Playbook',
    author: 'Rajesh Patel',
    category: 'Cloud & DevOps',
    description:
      'Step-by-step guides for Dockerizing services, provisioning Kubernetes clusters, managing Helm charts, and building resilient CI/CD pipelines.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
    featured: true
  }
];

const run = async () => {
  await connectDB();
  console.log('Clearing existing collections...');

  await Promise.all([
    AiUsage.deleteMany(),
    Book.deleteMany(),
    Category.deleteMany(),
    ContactMessage.deleteMany(),
    Course.deleteMany(),
    Enrollment.deleteMany(),
    Faq.deleteMany(),
    Payment.deleteMany(),
    Review.deleteMany(),
    Testimonial.deleteMany(),
    User.deleteMany(),
    WatchHistory.deleteMany()
  ]);

  const adminEmail = process.env.ADMIN_EMAIL || 'kumarmritunjay504@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Mritu@123';

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Mritunjay Kumar',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    libraryAccess: true,
    headline: 'Founder & Principal Lead'
  });

  const educator = await User.create({
    name: 'Vikram Sharma',
    email: 'educator@learnhub.ai',
    password: 'Educator@12345',
    role: 'educator',
    educatorSubject: 'Full Stack Development',
    headline: 'Senior Full Stack Architect',
    bio: '12+ years building enterprise SaaS platforms and mentoring aspiring developers.'
  });

  const learner = await User.create({
    name: 'Aarav Patel',
    email: 'student@learnhub.ai',
    password: 'Student@12345',
    role: 'student',
    headline: 'Aspiring Full Stack Engineer'
  });

  console.log('Creating categories...');
  const createdCategories = [];
  for (const category of categories) {
    createdCategories.push(await Category.create(category));
  }
  const categoryMap = new Map(createdCategories.map((c) => [c.name, c._id]));

  console.log('Creating courses...');
  const createdCourses = [];
  for (const course of courses) {
    const doc = await Course.create({
      ...course,
      category: categoryMap.get(course.category),
      instructorOwner: educator._id,
      studentsCount: Math.floor(Math.random() * 800) + 200,
      ratingAverage: 4.8 + Math.random() * 0.2,
      ratingCount: Math.floor(Math.random() * 80) + 20
    });
    createdCourses.push(doc);
  }

  console.log('Creating FAQs in MongoDB...');
  await Faq.insertMany(faqs);

  console.log('Creating Testimonials in MongoDB...');
  await Testimonial.insertMany(testimonials);

  console.log('Creating Books in MongoDB...');
  await Book.insertMany(books.map((b) => ({ ...b, uploadedBy: admin._id })));

  // Enroll demo student in the first course
  if (createdCourses.length > 0) {
    await Enrollment.create({
      user: learner._id,
      course: createdCourses[0]._id,
      progressPercent: 35,
      completedLessons: [
        {
          lessonId: createdCourses[0].curriculum[0].lessons[0]._id,
          completedAt: new Date()
        }
      ]
    });

    // Create a review
    await Review.create({
      user: learner._id,
      course: createdCourses[0]._id,
      rating: 5,
      comment: 'Exceptional course quality. The lessons are practical, comprehensive, and the code examples work flawlessly.'
    });
  }

  console.log('==============================================');
  console.log('LearnHub Academy Database Seed Complete!');
  console.log(`Admin:    ${adminEmail} / ${process.env.ADMIN_PASSWORD ? '********' : 'Mritu@123'}`);
  console.log('Educator: educator@learnhub.ai / Educator@12345');
  console.log('Student:  student@learnhub.ai / Student@12345');
  console.log(`Courses created: ${createdCourses.length}`);
  console.log(`FAQs created: ${faqs.length}`);
  console.log(`Testimonials created: ${testimonials.length}`);
  console.log('==============================================');

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
