import { useState } from 'react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import { api } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', password: '' });
  const [message, setMessage] = useState('');

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await updateProfile(profile);
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.patch('/auth/change-password', passwords);
      setPasswords({ currentPassword: '', password: '' });
      setMessage('Password changed.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <>
      <Seo title="Profile" description="Manage your LearnHub AI LMS profile and password." />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-ink">Profile</h1>
        {message && <p className="mt-4 rounded-xl bg-white/75 p-4 text-sm font-bold text-slate-700">{message}</p>}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <GlassCard className="p-6">
            <h2 className="text-2xl font-black text-ink">Account details</h2>
            <form onSubmit={saveProfile} className="mt-5 space-y-4">
              {[
                ['name', 'Name'],
                ['headline', 'Headline'],
                ['avatar', 'Avatar URL']
              ].map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
                  <input value={profile[key]} onChange={(event) => setProfile({ ...profile, [key]: event.target.value })} className="h-12 w-full rounded-xl border border-white/80 bg-white/75 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
                </label>
              ))}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Bio</span>
                <textarea rows={5} value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} className="w-full rounded-xl border border-white/80 bg-white/75 p-4 outline-none focus:ring-2 focus:ring-brand-500" />
              </label>
              <Button>Save Profile</Button>
            </form>
          </GlassCard>
          <GlassCard className="p-6">
            <h2 className="text-2xl font-black text-ink">Password</h2>
            <form onSubmit={changePassword} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Current password</span>
                <input type="password" required value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} className="h-12 w-full rounded-xl border border-white/80 bg-white/75 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">New password</span>
                <input type="password" minLength={8} required value={passwords.password} onChange={(event) => setPasswords({ ...passwords, password: event.target.value })} className="h-12 w-full rounded-xl border border-white/80 bg-white/75 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
              </label>
              <Button>Change Password</Button>
            </form>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
