import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';
import { api } from '../../api/client';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setStatus('');
    try {
      await api.post('/contact', form);
      setForm({ name: '', email: '', subject: '', message: '' });
      setStatus('Message sent.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <>
      <Seo title="Contact" description="Contact LearnHub AI LMS." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Contact" title="Talk to LearnHub" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <GlassCard className="p-6">
            <div className="space-y-5 text-sm font-bold text-slate-700">
              <p className="flex items-center gap-3">
                <Mail className="text-brand-600" /> support@learnhub.ai
              </p>
              <p className="flex items-center gap-3">
                <Phone className="text-emerald-600" /> +91 90000 00000
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="text-rose-600" /> Remote-first education team
              </p>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
                <input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <input required placeholder="Subject" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
              <textarea required rows={6} placeholder="Message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="rounded-xl border border-white/80 bg-white/75 p-4 outline-none focus:ring-2 focus:ring-brand-500" />
              <Button>Send Message</Button>
              {status && <p className="text-sm font-bold text-muted">{status}</p>}
            </form>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
