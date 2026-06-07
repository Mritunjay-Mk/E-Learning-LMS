import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, UserRound, LockKeyhole } from 'lucide-react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import { useAuthStore } from '../../stores/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const dashboardPath = (user) => (user.role === 'admin' ? '/admin' : user.role === 'educator' ? '/educator' : '/dashboard');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = await register(form);
      navigate(dashboardPath(user));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Seo title="Register" description="Create your LearnHub AI LMS student account." />
      <section className="mx-auto grid min-h-[calc(100vh-var(--nav-height))] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <GlassCard strong className="mx-auto w-full max-w-md p-6">
          <h1 className="text-3xl font-black text-ink">Create account</h1>
          <p className="mt-2 text-sm text-muted">
            Students and educators start here. After an educator signs up, the admin can switch their role to educator, add a subject, and assign courses from the admin dashboard.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Name</span>
              <span className="relative block">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-12 w-full rounded-xl border border-white/80 bg-white/75 pl-11 pr-4 outline-none focus:ring-2 focus:ring-brand-500" />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
              <span className="relative block">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="h-12 w-full rounded-xl border border-white/80 bg-white/75 pl-11 pr-4 outline-none focus:ring-2 focus:ring-brand-500" />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="h-12 w-full rounded-xl border border-white/80 bg-white/75 pl-11 pr-4 outline-none focus:ring-2 focus:ring-brand-500" />
              </span>
            </label>
            {error && <p className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
            <Button disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Start Learning'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm font-semibold text-muted">
            Already registered?{' '}
            <Link to="/login" className="text-brand-700">
              Login
            </Link>
          </p>
        </GlassCard>
        <div className="hidden lg:block">
          <div className="glass-strong rounded-3xl p-5">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80" alt="Learners collaborating online" className="aspect-[4/3] rounded-2xl object-cover" />
          </div>
        </div>
      </section>
    </>
  );
}
