import { Bot, GraduationCap, Library, ShieldCheck } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';

const items = [
  [GraduationCap, 'Project-first courses', 'Curriculum, video playback, reviews, and completion tracking live in the same product surface.'],
  [Bot, 'AI learning support', 'Gemini-powered tutor, notes, summaries, and quizzes help learners revise with context.'],
  [Library, 'Gated PDF library', 'Students get library access from course ownership, while standalone learners can purchase a pass.'],
  [ShieldCheck, 'Secure operations', 'JWT auth, roles, protected APIs, CORS controls, validation, and payment verification are built in.']
];

export default function About() {
  return (
    <>
      <Seo title="About" description="About LearnHub AI LMS and its AI-powered learning workflows." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="About LearnHub" title="A full-stack LMS made for modern learning">
          LearnHub AI LMS brings course commerce, video learning, AI study help, PDF resources, and admin analytics into a single MERN platform.
        </SectionHeading>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map(([Icon, title, text]) => (
            <GlassCard key={title} className="p-6">
              <span className="brand-gradient grid h-12 w-12 place-items-center rounded-xl text-white">
                <Icon />
              </span>
              <h2 className="mt-5 text-2xl font-black text-ink">{title}</h2>
              <p className="mt-3 leading-7 text-muted">{text}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </>
  );
}
