import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, CheckCircle2, Library, PlayCircle, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import Button from '../../components/common/Button';
import CourseCard from '../../components/common/CourseCard';
import GlassCard from '../../components/common/GlassCard';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';
import StatCard from '../../components/common/StatCard';
import { CourseCardSkeleton } from '../../components/common/Skeleton';
import { sampleCourses } from '../../data/catalog';
import { useCourseStore } from '../../stores/courseStore';

const metrics = [
  { label: 'Active learners', value: '50K+', icon: Users, tone: 'brand' },
  { label: 'AI study actions', value: '1.2M', icon: Bot, tone: 'mint' },
  { label: 'Completion lift', value: '34%', icon: Trophy, tone: 'amber' },
  { label: 'Secure payments', value: 'UPI', icon: ShieldCheck, tone: 'coral' }
];

const workflows = [
  ['Discover', 'Browse polished course cards, filter by category, and preview YouTube lessons in-page.'],
  ['Purchase', 'Pay through Razorpay with UPI, then unlock course watching and library access.'],
  ['Learn', 'Watch lessons, track progress, save history, and ask AI for notes, quizzes, and summaries.'],
  ['Manage', 'Admins control courses, PDFs, users, revenue, and AI usage from one dashboard.']
];

export default function Home() {
  const { featured, fetchFeatured } = useCourseStore();

  useEffect(() => {
    fetchFeatured().catch(() => {});
  }, [fetchFeatured]);

  const courses = featured.length ? featured : sampleCourses;

  return (
    <>
      <Seo title="Home" description="LearnHub AI LMS is a production-ready MERN learning platform with AI tutor, courses, library, payments, and analytics." />

      <section className="relative overflow-hidden px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-brand-700 shadow-sm">
              <Sparkles size={16} />
              AI-powered learning, payments, and library in one LMS
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-tight text-ink sm:text-6xl lg:text-7xl">
              LearnHub <span className="text-gradient">AI LMS</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              A glassmorphism SaaS learning platform for premium courses, PDF library access, AI tutoring, progress tracking, and admin analytics.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/courses">
                Explore Courses <ArrowRight size={18} />
              </Button>
              <Button to="/library" variant="secondary">
                <Library size={18} /> Open Library
              </Button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['JWT protected routes', 'Razorpay + UPI', 'Gemini AI tutor'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <CheckCircle2 className="text-emerald-600" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12, duration: 0.6 }} className="relative">
            <GlassCard strong className="overflow-hidden p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
                  alt="Online learning dashboard"
                  className="h-full w-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/88 p-4 backdrop-blur-xl">
                    <span className="brand-gradient grid h-12 w-12 place-items-center rounded-xl text-white">
                      <PlayCircle />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-muted">Continue learning</p>
                      <p className="font-black text-ink">MERN Stack Mastery with AI Projects</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="absolute -bottom-6 -left-4 hidden w-56 p-4 sm:block">
              <p className="text-sm font-bold text-muted">This week</p>
              <p className="mt-1 text-3xl font-black text-ink">87%</p>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div className="h-full w-[87%] rounded-full brand-gradient" />
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Featured Courses" title="Course cards built for quick decisions">
            Preview video thumbnails, ratings, category tags, pricing, and progress-ready curriculum.
          </SectionHeading>
          <Button to="/courses" variant="secondary">
            View all <ArrowRight size={18} />
          </Button>
        </div>
        <div className="mt-10 grid gap-6 safe-grid">
          {courses.length
            ? courses.map((course) => <CourseCard key={course._id} course={course} />)
            : Array.from({ length: 3 }).map((_, index) => <CourseCardSkeleton key={index} />)}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="LMS Workflow" title="From catalog to completion" align="center">
          The platform connects student learning, AI help, purchases, and admin operations without separate tools.
        </SectionHeading>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {workflows.map(([title, text], index) => (
            <GlassCard key={title} className="p-5">
              <span className="brand-gradient grid h-11 w-11 place-items-center rounded-xl text-lg font-black text-white">{index + 1}</span>
              <h3 className="mt-5 text-xl font-black text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <GlassCard strong className="grid items-center gap-8 overflow-hidden p-6 md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <div>
            <SectionHeading eyebrow="AI Study Layer" title="Tutor, notes, summaries, and quizzes">
              Gemini-powered endpoints help learners solve doubts, revise faster, and convert lessons into structured practice.
            </SectionHeading>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Doubt solving', 'Lesson notes', 'Quiz JSON', 'AI analytics'].map((item) => (
                <span key={item} className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-ink p-5 text-white shadow-glow">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Bot className="text-emerald-300" />
              <div>
                <p className="font-black">LearnHub AI Tutor</p>
                <p className="text-sm text-white/60">Lesson-aware guidance</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-6">
              <p className="rounded-2xl bg-white/10 p-4">Explain JWT authentication with an LMS example.</p>
              <p className="rounded-2xl bg-emerald-400/15 p-4 text-emerald-50">
                JWT is a signed token that lets the LMS confirm who the learner is before opening dashboards, purchases, and watch progress.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>
    </>
  );
}
