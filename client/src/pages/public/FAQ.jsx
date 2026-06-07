import GlassCard from '../../components/common/GlassCard';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';
import { faqItems } from '../../data/catalog';

export default function FAQ() {
  return (
    <>
      <Seo title="FAQ" description="Frequently asked questions about LearnHub AI LMS." />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Common questions" align="center" />
        <div className="mt-8 space-y-4">
          {faqItems.map((item) => (
            <GlassCard key={item.question} className="p-5">
              <h2 className="text-lg font-black text-ink">{item.question}</h2>
              <p className="mt-2 leading-7 text-muted">{item.answer}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </>
  );
}
