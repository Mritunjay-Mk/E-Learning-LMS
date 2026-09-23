import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  Code2,
  GraduationCap,
  Library,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from 'lucide-react';
import { api } from '../../api/client';
import Button from '../../components/common/Button';
import CourseCard from '../../components/common/CourseCard';
import GlassCard from '../../components/common/GlassCard';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';
import StatCard from '../../components/common/StatCard';
import { CourseCardSkeleton } from '../../components/common/Skeleton';
import { useCourseStore } from '../../stores/courseStore';

// Top tech employers badge list
const companyLogos = ['Razorpay', 'Flipkart', 'Swiggy', 'Microsoft', 'Google', 'Amazon', 'Infosys'];

// Step-by-step learning journey roadmap
const learningSteps = [
  {
    step: '01',
    title: 'Choose Your Career Path',
    text: 'Select from comprehensive, mentor-designed tracks in Full Stack, AI Engineering, Cloud DevOps, or System Design.'
  },
  {
    step: '02',
    title: 'Build Production Capstones',
    text: 'Code real-world applications with modern tech stacks, proper database schemas, authentication, and security.'
  },
  {
    step: '03',
    title: '24/7 AI Tutor & Code Reviews',
    text: 'Never get stuck. Ask our lesson-aware AI assistant for immediate explanations, debugging tips, and quiz drills.'
  },
  {
    step: '04',
    title: 'Certify & Accelerate Career',
    text: 'Pass module assessments to earn verifiable credentials and showcase polished repositories to tech recruiters.'
  }
];

// Core platform highlights
const platformHighlights = [
  {
    icon: Code2,
    title: 'Production-First Curriculum',
    description: 'Learn by engineering real microservices, secure payment workflows, and scalable architectures.'
  },
  {
    icon: Bot,
    title: 'Context-Aware AI Tutor',
    description: 'Integrated directly inside video lessons for instant syntax explanations, doubt resolution, and quizzes.'
  },
  {
    icon: Library,
    title: 'Comprehensive PDF Library',
    description: 'Access curated architectural handbooks, deployment playbooks, and system design interview cheat-sheets.'
  },
  {
    icon: Award,
    title: 'Verifiable Certification',
    description: 'Earn digital credentials upon project submission and quiz completion to showcase on your LinkedIn profile.'
  }
];

export default function Home() {
  const { featured, fetchFeatured, loading: coursesLoading } = useCourseStore();
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalCourses: 6,
    totalLessons: 48,
    averageRating: 4.9
  });
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  // Fetch featured courses, live MongoDB statistics, and student testimonials
  useEffect(() => {
    fetchFeatured().catch(() => {});

    // Fetch live statistics from MongoDB
    api
      .get('/public/stats')
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {});

    // Fetch real testimonials from MongoDB
    api
      .get('/testimonials')
      .then((data) => {
        if (data.testimonials) setTestimonials(data.testimonials);
      })
      .catch(() => {})
      .finally(() => setLoadingTestimonials(false));
  }, [fetchFeatured]);

  return (
    <>
      <Seo
        title="Home"
        description="LearnHub Academy - Accelerate your engineering career with industry-leading Full Stack, Generative AI, and DevOps courses."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/70 px-4 py-2 text-sm font-bold text-brand-700 shadow-sm">
              <Sparkles size={16} />
              <span>Next-Gen Software Engineering & AI Academy</span>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Master Tech Skills with <span className="text-gradient">Real-World Projects</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted sm:text-xl">
              Learn production software engineering, Generative AI, and DevOps from experienced architects. Build portfolio-ready applications with continuous guidance from our 24/7 AI tutor.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button to="/courses" size="lg">
                Explore Courses <ArrowRight size={18} />
              </Button>
              <Button to="/library" variant="secondary" size="lg">
                <Library size={18} /> Resource Library
              </Button>
            </div>

            {/* Value Checkpoints */}
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                'Practical Capstone Projects',
                '24/7 AI Doubt Clearing',
                'Industry Recognized Certificate'
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <CheckCircle2 className="shrink-0 text-emerald-600" size={17} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="relative w-full max-w-xl lg:ml-auto"
          >
            <GlassCard strong className="overflow-hidden p-3 shadow-2xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                  alt="Students coding together"
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                
                {/* Floating Preview Card */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 p-4 shadow-xl backdrop-blur-xl">
                    <span className="brand-gradient grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white shadow-md">
                      <PlayCircle size={26} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Featured Masterclass</p>
                      <p className="truncate font-black text-ink">Full-Stack MERN Architecture</p>
                      <p className="text-xs text-muted">22 hours &bull; Project-driven curriculum</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Alumni Company Logos */}
        <div className="mx-auto mt-16 max-w-7xl border-t border-slate-200/60 pt-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted">
            Our alumni are building software at leading engineering companies
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-70">
            {companyLogos.map((company) => (
              <span key={company} className="text-base font-extrabold tracking-tight text-slate-600">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Live MongoDB Platform Metrics */}
      <section className="mx-auto mt-20 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <StatCard
          icon={Users}
          label="Active Learners"
          value={`${stats.totalStudents || 1200}+`}
          tone="brand"
        />
        <StatCard
          icon={BookOpen}
          label="Curated Courses"
          value={stats.totalCourses || 6}
          tone="mint"
        />
        <StatCard
          icon={PlayCircle}
          label="Production Lessons"
          value={`${stats.totalLessons || 48}+`}
          tone="amber"
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={`${stats.averageRating || 4.9} / 5.0`}
          tone="coral"
        />
      </section>

      {/* Featured Courses Section */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Curated Programs"
            title="Industry-Led Masterclasses"
          >
            In-depth technical curriculum designed around real production code, hands-on labs, and portfolio capstones.
          </SectionHeading>
          <Button to="/courses" variant="secondary">
            View All Courses <ArrowRight size={18} />
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coursesLoading
            ? Array.from({ length: 3 }).map((_, index) => <CourseCardSkeleton key={index} />)
            : featured.map((course) => <CourseCard key={course._id} course={course} />)}
        </div>
      </section>

      {/* Why Learn with Us - Highlights */}
      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The LearnHub Advantage"
          title="Engineered for Real Engineering Outcomes"
          align="center"
        >
          We bridge the gap between superficial video tutorials and actual production engineering standards.
        </SectionHeading>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {platformHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard key={item.title} className="p-6 transition hover:shadow-glow">
                <span className="brand-gradient grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-xl font-black text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* How It Works - Learning Roadmap */}
      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Learning Roadmap"
          title="From Fundamentals to Production Mastery"
          align="center"
        >
          A proven four-step methodology to transform your technical skills into employable expertise.
        </SectionHeading>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {learningSteps.map((step) => (
            <GlassCard key={step.step} className="p-6 relative overflow-hidden">
              <span className="font-mono text-3xl font-black text-brand-200">{step.step}</span>
              <h3 className="mt-3 text-lg font-black text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Student Testimonials Section (Dynamically Loaded from MongoDB) */}
      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Student Stories"
          title="What Our Graduates Are Saying"
          align="center"
        >
          Hear directly from developers who switched careers, secured promotions, and built scalable software.
        </SectionHeading>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loadingTestimonials ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-56 rounded-2xl" />
            ))
          ) : (
            testimonials.slice(0, 3).map((item) => (
              <GlassCard key={item._id} className="flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {Array.from({ length: item.rating || 5 }).map((_, idx) => (
                      <Star key={idx} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm italic leading-relaxed text-slate-700">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-200/60 pt-4">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="h-11 w-11 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <span className="brand-gradient grid h-11 w-11 place-items-center rounded-full text-sm font-bold text-white">
                      {item.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <h4 className="font-black text-ink">{item.name}</h4>
                    <p className="text-xs font-semibold text-muted">
                      {item.role} {item.company && `at ${item.company}`}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </section>

      {/* AI Tutor Feature Spotlight */}
      <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
        <GlassCard strong className="grid items-center gap-8 overflow-hidden p-6 md:grid-cols-2 md:p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-700">
              <Bot size={15} /> Built-in AI Study Companion
            </div>
            <h2 className="mt-4 text-3xl font-black text-ink sm:text-4xl">
              24/7 Context-Aware AI Tutor for Instant Code Help
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Never wait hours for answers on message boards. Our Gemini-powered AI tutor understands the current lesson video, code context, and architecture to give you tailored explanations and practice quizzes.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Code Explanations', 'Instant Debugging', 'Custom Quizzes', 'Concept Summaries'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
            <div className="mt-8">
              <Button to="/courses">Try a Masterclass</Button>
            </div>
          </div>

          {/* Interactive Chat Simulation */}
          <div className="rounded-2xl bg-ink p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/20 text-brand-400">
                <Bot size={20} />
              </span>
              <div>
                <p className="font-black text-white">LearnHub AI Tutor</p>
                <p className="text-xs text-white/60">Lesson: Full-Stack MERN Architecture</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-relaxed">
              <div className="rounded-xl bg-white/10 p-3.5 text-white/90">
                <p className="font-semibold text-xs text-brand-300 mb-1">You asked:</p>
                How do we prevent replay attacks with JWT refresh tokens in our LMS backend?
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-100">
                <p className="font-semibold text-xs text-emerald-300 mb-1">AI Tutor:</p>
                Store a rotating <code className="rounded bg-black/40 px-1.5 py-0.5 text-emerald-200">refreshTokenFamily</code> in MongoDB. When a refresh token is used, invalidate it and issue a new one. If an invalidated token is ever presented again, revoke the entire family immediately to protect the student account.
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Ready to Accelerate CTA Banner */}
      <section className="mx-auto my-28 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="brand-gradient rounded-3xl p-8 text-center text-white shadow-2xl sm:p-14">
          <GraduationCap className="mx-auto h-16 w-16 text-white/90" />
          <h2 className="mt-6 text-3xl font-black sm:text-4xl lg:text-5xl">
            Ready to Take Your Tech Career to the Next Level?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
            Join thousands of software engineers learning practical full-stack, AI, and cloud development with LearnHub Academy.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              to="/courses"
              className="bg-white text-brand-700 hover:bg-slate-100 shadow-lg"
              size="lg"
            >
              Browse All Courses <ArrowRight size={18} />
            </Button>
            <Button
              to="/register"
              variant="secondary"
              className="border-white/30 text-white hover:bg-white/10"
              size="lg"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
