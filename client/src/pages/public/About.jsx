import { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Target,
  Users
} from 'lucide-react';
import { api } from '../../api/client';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';

const coreValues = [
  {
    icon: Target,
    title: 'Practical Production First',
    description:
      'We believe the only true way to learn software engineering is by building real, deployable systems rather than passive toy examples.'
  },
  {
    icon: Lightbulb,
    title: 'AI-Augmented Learning',
    description:
      'We harness modern AI to empower students with 24/7 personalized explanations, code reviews, and instant doubt resolution.'
  },
  {
    icon: HeartHandshake,
    title: 'Genuine Industry Mentorship',
    description:
      'Our curriculum is authored and reviewed by staff architects and engineers who actively build production systems in top tech companies.'
  },
  {
    icon: Briefcase,
    title: 'Career Readiness Focus',
    description:
      'Every capstone, assignment, and quiz is tailored to help you build an impressive engineering portfolio that stands out to recruiters.'
  }
];

export default function About() {
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);

  // Fetch verified instructors from backend API
  useEffect(() => {
    api
      .get('/public/instructors')
      .then((data) => {
        if (data.instructors) setInstructors(data.instructors);
      })
      .catch(() => {})
      .finally(() => setLoadingInstructors(false));
  }, []);

  return (
    <>
      <Seo
        title="About Us"
        description="Learn about LearnHub Academy's mission to empower engineers with practical software development and AI engineering skills."
      />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50/70 px-4 py-1.5 text-xs font-bold text-brand-700 shadow-sm">
            <GraduationCap size={15} />
            <span>Our Mission & Vision</span>
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Democratizing <span className="text-gradient">Production-Grade</span> Tech Education
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted sm:text-xl">
            LearnHub Academy was founded on a simple conviction: conventional education is too disconnected from the realities of modern software engineering. We are building the academy we wished we had when starting out.
          </p>
        </div>

        {/* Story & Philosophy Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <GlassCard className="p-8">
            <h2 className="text-2xl font-black text-ink">Why We Built LearnHub</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Most online tutorials teach isolated syntax snippets that fail as soon as you step into a real engineering team. In production, you deal with asynchronous state, database concurrency, webhook signatures, rate limiting, and zero-downtime CI/CD deployments.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              LearnHub Academy was created to bridge that gap. We designed project-first learning paths paired with an intelligent 24/7 AI study companion so that ambitious engineers can build production systems from day one.
            </p>
          </GlassCard>

          <GlassCard className="p-8">
            <h2 className="text-2xl font-black text-ink">The LearnHub Standard</h2>
            <div className="mt-5 space-y-3.5">
              {[
                'Full architectural transparency with real production codebases',
                'Context-aware AI tutor to resolve coding blockers immediately',
                'Comprehensive PDF resources, design cheat-sheets, and checklists',
                'Direct support and code reviews from industry mentors',
                'Verifiable completion credentials shareable on LinkedIn'
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                  <CheckCircle size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Core Values */}
        <div className="mt-24">
          <SectionHeading
            eyebrow="Our Core Values"
            title="Principles That Guide Everything We Build"
            align="center"
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((val) => {
              const Icon = val.icon;
              return (
                <GlassCard key={val.title} className="p-6">
                  <span className="brand-gradient grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-lg font-black text-ink">{val.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{val.description}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Verified Instructors Showcase (from MongoDB API) */}
        <div className="mt-28">
          <SectionHeading
            eyebrow="Industry Mentors"
            title="Learn Directly from Tech Leaders"
            align="center"
          >
            Our instructors bring years of real-world architecture experience from top technology companies.
          </SectionHeading>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {loadingInstructors ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-2xl" />
              ))
            ) : instructors.length > 0 ? (
              instructors.map((inst) => (
                <GlassCard key={inst._id} className="p-6 text-center">
                  {inst.avatar ? (
                    <img
                      src={inst.avatar}
                      alt={inst.name}
                      className="mx-auto h-24 w-24 rounded-2xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="brand-gradient mx-auto grid h-24 w-24 place-items-center rounded-2xl text-2xl font-black text-white shadow-md">
                      {inst.name.charAt(0)}
                    </div>
                  )}

                  <h3 className="mt-5 text-xl font-black text-ink">{inst.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mt-1">
                    {inst.headline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">
                    {inst.bio}
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 border-t border-slate-100 pt-4">
                    <BookOpen size={15} className="text-brand-600" />
                    <span>Mentoring in {inst.subject}</span>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="col-span-full p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-3 text-lg font-black text-ink">Instructors updating...</h3>
                <p className="text-sm text-muted">Verified mentor profiles will appear here shortly.</p>
              </GlassCard>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-28 rounded-3xl brand-gradient p-10 text-center text-white shadow-2xl sm:p-14">
          <h2 className="text-3xl font-black sm:text-4xl">Start Your Learning Journey Today</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85 text-base sm:text-lg">
            Explore our curriculum, build practical applications, and elevate your technical career.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button to="/courses" className="bg-white text-brand-700 hover:bg-slate-100 shadow-lg">
              Explore Masterclasses
            </Button>
            <Button to="/contact" variant="secondary" className="border-white/30 text-white hover:bg-white/10">
              Talk to an Advisor
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
