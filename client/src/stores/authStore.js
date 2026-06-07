import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: '',
      loading: false,
      hydrated: false,
      error: '',
      get isAuthenticated() {
        return Boolean(get().token && get().user);
      },
      get isAdmin() {
        return get().user?.role === 'admin';
      },
      setHydrated: () => set({ hydrated: true }),
      login: async (payload) => {
        set({ loading: true, error: '' });
        try {
          const data = await api.post('/auth/login', payload);
          set({ user: data.user, token: data.token, loading: false });
          return data.user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      register: async (payload) => {
        set({ loading: true, error: '' });
        try {
          const data = await api.post('/auth/register', payload);
          set({ user: data.user, token: data.token, loading: false });
          return data.user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      fetchMe: async () => {
        if (!get().token) return null;
        try {
          const data = await api.get('/auth/me');
          set({ user: data.user });
          return data.user;
        } catch {
          set({ user: null, token: '' });
          return null;
        }
      },
      updateProfile: async (payload) => {
        const data = await api.patch('/auth/profile', payload);
        set({ user: data.user });
        return data.user;
      },
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } finally {
          set({ user: null, token: '' });
        }
      }
    }),
    {
      name: 'learnhub-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => state?.setHydrated()
    }
  )
);
