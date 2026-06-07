import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import { api } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAuthStore.setState;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await api.post(`/auth/reset-password/${token}`, { password });
      setAuth({ user: data.user, token: data.token });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Seo title="Reset Password" description="Create a new LearnHub AI LMS password." />
      <section className="mx-auto grid min-h-[calc(100vh-var(--nav-height))] max-w-7xl place-items-center px-4 py-12">
        <GlassCard strong className="w-full max-w-md p-6">
          <h1 className="text-3xl font-black text-ink">New password</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" className="h-12 w-full rounded-xl border border-white/80 bg-white/75 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
            {error && <p className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
            <Button className="w-full">Save Password</Button>
          </form>
        </GlassCard>
      </section>
    </>
  );
}
