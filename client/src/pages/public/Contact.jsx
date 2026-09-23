import { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/contact', form);
      setForm({ name: '', email: '', subject: '', message: '' });
      setStatus({
        type: 'success',
        message: response.message || 'Thank you! Your message has been received. Our team will get back to you within 24 hours.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to send message. Please try again or email us directly.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch with the LearnHub Academy support and admissions team for course inquiries, corporate training, and technical assistance."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Get In Touch"
          title="We'd Love to Hear From You"
        >
          Have questions about our curriculum, enterprise cohorts, or need help with your account? Our team is always ready to assist.
        </SectionHeading>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <GlassCard className="p-7">
              <h2 className="text-xl font-black text-ink">Contact Information</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Reach out to us directly or fill in the form and an academic advisor will connect with you.
              </p>

              <div className="mt-6 space-y-5 text-sm font-semibold text-slate-700">
                <div className="flex items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Mail size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted">Email Us</p>
                    <a
                      href="mailto:support@learnhub.ai"
                      className="font-bold text-ink hover:text-brand-600 transition"
                    >
                      support@learnhub.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Phone size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted">Student Support Line</p>
                    <p className="font-bold text-ink">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                    <Clock size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted">Working Hours</p>
                    <p className="font-bold text-ink">Monday – Saturday, 9:00 AM – 7:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                    <MapPin size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted">Headquarters</p>
                    <p className="font-bold text-ink">Tech Innovation Hub, Bangalore, Karnataka, India</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Quick FAQ Reference Box */}
            <GlassCard className="p-6">
              <h3 className="font-black text-ink flex items-center gap-2">
                <MessageSquare size={18} className="text-brand-600" />
                Frequently Asked
              </h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Looking for answers about refunds, certificates, or course access?
              </p>
              <Link
                to="/faq"
                className="mt-3 inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                Browse FAQ Knowledge Base &rarr;
              </Link>
            </GlassCard>
          </div>

          {/* Inquiry Form */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-black text-ink">Send Us a Message</h2>
            <p className="mt-1 text-sm text-muted">
              Fill in your details below and we will respond as soon as possible.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 text-sm font-semibold text-ink shadow-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 text-sm font-semibold text-ink shadow-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject *
                </label>
                <input
                  required
                  placeholder="e.g. Course curriculum inquiry or payment question"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 text-sm font-semibold text-ink shadow-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us what you need assistance with..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/80 bg-white/80 p-4 text-sm font-semibold text-ink shadow-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Status Banner */}
              {status.message && (
                <div
                  className={`flex items-start gap-3 rounded-xl p-4 text-sm font-bold ${
                    status.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {status.type === 'success' && <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />}
                  <span>{status.message}</span>
                </div>
              )}

              <Button disabled={submitting} className="w-full sm:w-auto">
                <Send size={16} />
                {submitting ? 'Sending inquiry...' : 'Send Message'}
              </Button>
            </form>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
