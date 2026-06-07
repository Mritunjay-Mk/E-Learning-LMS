import { create } from 'zustand';
import { api } from '../api/client';

export const useCourseStore = create((set, get) => ({
  courses: [],
  featured: [],
  categories: [],
  pagination: null,
  loading: false,
  error: '',
  filters: {
    search: '',
    category: '',
    level: '',
    price: '',
    sort: 'newest',
    page: 1
  },
  setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),
  fetchCategories: async () => {
    const data = await api.get('/categories');
    set({ categories: data.categories });
    return data.categories;
  },
  fetchFeatured: async () => {
    const data = await api.get('/courses/featured');
    set({ featured: data.courses });
    return data.courses;
  },
  fetchCourses: async (filters = get().filters) => {
    set({ loading: true, error: '' });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const data = await api.get(`/courses?${params.toString()}`);
      set({ courses: data.courses, pagination: data.pagination, loading: false });
      return data.courses;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
