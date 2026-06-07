import { useState } from 'react';
import { Mail } from 'lucide-react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import { api } from '../../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = await api.post('/auth/forgot-password', { email });
      setMessage(data.resetUrl ? `${data.message} Dev reset URL: ${data.resetUrl}` : data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Forgot Password" description="Reset your LearnHub AI LMS password." />
      <section className="mx-auto grid min-h-[calc(100vh-var(--nav-height))] max-w-7xl place-items-center px-4 py-12">
        <GlassCard strong className="w-full max-w-md p-6">
          <h1 className="text-3xl font-black text-ink">Reset password</h1>
          <p className="mt-2 text-sm text-muted">Enter your account email and we will send a secure reset link.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
              <span className="relative block">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-xl border border-white/80 bg-white/75 pl-11 pr-4 outline-none focus:ring-2 focus:ring-brand-500" />
              </span>
            </label>
            <Button disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          {message && <p className="mt-4 rounded-xl bg-white/70 p-4 text-sm font-semibold leading-6 text-slate-700">{message}</p>}
        </GlassCard>
      </section>
    </>
  );
}
