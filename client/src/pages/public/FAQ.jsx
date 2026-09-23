import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, HelpCircle, Mail, MessageSquare, Search } from 'lucide-react';
import { api } from '../../api/client';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';

const categories = ['All', 'General', 'Courses', 'Payments & Billing', 'AI Tutor', 'Certificates'];

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch categorized FAQs from MongoDB API
  useEffect(() => {
    setLoading(true);
    api
      .get('/faqs')
      .then((data) => {
        if (data.faqs) setFaqs(data.faqs);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load FAQs');
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter FAQs based on selected category tab and search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Seo
        title="Frequently Asked Questions"
        description="Find answers to common questions about LearnHub Academy courses, certification, AI tutoring, and payments."
      />

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Help & Knowledge Base"
          title="Frequently Asked Questions"
          align="center"
        >
          Everything you need to know about our curriculum, 24/7 AI tutor, enrollment access, and certifications.
        </SectionHeading>

        {/* Search bar */}
        <div className="mt-10">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
            <input
              type="search"
              placeholder="Search answers by keyword (e.g. refund, certificate, lifetime access)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-13 w-full rounded-2xl border border-slate-200/80 bg-white/80 pl-12 pr-4 text-sm font-semibold text-ink shadow-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setOpenIndex(null);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'brand-gradient text-white shadow-sm'
                  : 'bg-white/70 text-slate-600 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error notification if API fails */}
        {error && (
          <div className="mt-8 rounded-2xl bg-rose-50 p-4 text-center text-sm font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* FAQ Accordion List */}
        <div className="mt-8 space-y-3.5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-18 rounded-2xl" />
            ))
          ) : filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <GlassCard
                  key={faq._id || index}
                  className="overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle size={18} className="shrink-0 text-brand-600" />
                      <span className="font-extrabold text-ink sm:text-base">{faq.question}</span>
                    </span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-brand-50 text-brand-600' : ''
                      }`}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100/80 px-5 pb-5 pt-3">
                      <p className="text-sm leading-relaxed text-muted sm:text-base">
                        {faq.answer}
                      </p>
                      {faq.category && (
                        <span className="mt-3 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {faq.category}
                        </span>
                      )}
                    </div>
                  )}
                </GlassCard>
              );
            })
          ) : (
            <GlassCard className="p-8 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-lg font-black text-ink">No questions found</h3>
              <p className="mt-1 text-sm text-muted">
                Try searching with different terms or selecting another category.
              </p>
            </GlassCard>
          )}
        </div>

        {/* Contact Support CTA Box */}
        <div className="mt-14 rounded-3xl border border-white/60 bg-white/70 p-8 text-center shadow-glass backdrop-blur-xl">
          <Mail className="mx-auto h-10 w-10 text-brand-600" />
          <h3 className="mt-3 text-xl font-black text-ink">Still have questions?</h3>
          <p className="mt-2 text-sm text-muted">
            Can&apos;t find what you&apos;re looking for? Our student admissions and advisory team are here to help.
          </p>
          <div className="mt-5">
            <Button to="/contact">Contact Support</Button>
          </div>
        </div>
      </section>
    </>
  );
}
