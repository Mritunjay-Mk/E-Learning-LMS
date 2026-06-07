import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import { useAuthStore } from '../../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const dashboardPath = (user) => (user.role === 'admin' ? '/admin' : user.role === 'educator' ? '/educator' : '/dashboard');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = await login(form);
      navigate(location.state?.from || dashboardPath(user));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Seo title="Login" description="Sign in to LearnHub AI LMS." />
      <section className="mx-auto grid min-h-[calc(100vh-var(--nav-height))] max-w-7xl items-center px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="hidden lg:block">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Welcome back</p>
          <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight text-ink">Your courses, AI notes, watch history, and library are ready.</h1>
        </div>
        <GlassCard strong className="mx-auto w-full max-w-md p-6">
          <h2 className="text-3xl font-black text-ink">Login</h2>
          <p className="mt-2 text-sm text-muted">Use your LearnHub account to continue.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
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
                <input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="h-12 w-full rounded-xl border border-white/80 bg-white/75 pl-11 pr-4 outline-none focus:ring-2 focus:ring-brand-500" />
              </span>
            </label>
            {error && <p className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
            <Button disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm font-semibold">
            <Link to="/forgot-password" className="text-brand-700">
              Forgot password?
            </Link>
            <Link to="/register" className="text-slate-700">
              Create account
            </Link>
          </div>
        </GlassCard>
      </section>
    </>
  );
}
