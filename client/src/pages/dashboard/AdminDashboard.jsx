import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  WandSparkles,
  XCircle
} from 'lucide-react';
import { api } from '../../api/client';
import Button from '../../components/common/Button';
import CurriculumBuilder from '../../components/common/CurriculumBuilder';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import StatCard from '../../components/common/StatCard';
import { useAuthStore } from '../../stores/authStore';
import { money } from '../../utils/format';

const tabs = [
  ['overview', 'Overview', LayoutDashboard],
  ['courses', 'Courses', BookOpen],
  ['library', 'Library', FileText],
  ['users', 'Users', Users],
  ['requests', 'Requests', ClipboardList],
  ['assignments', 'Assignments', CheckCircle2],
  ['faqs', 'FAQs', HelpCircle],
  ['contacts', 'Inquiries', Mail],
  ['payments', 'Payments', CreditCard]
];

const initialCourse = {
  title: '',
  subtitle: '',
  description: '',
  category: '',
  level: 'Beginner',
  price: 0,
  discountPrice: '',
  duration: '8 hours',
  previewVideoUrl: '',
  instructorOwner: '',
  status: 'published',
  featured: false,
  tags: 'React, Node.js, Web Development',
  outcomes: 'Build a production feature\nDeploy with confidence\nMaster clean architecture',
  requirements: 'Basic programming knowledge\nFamiliarity with terminal commands',
  curriculum: [
    {
      title: 'Module 1: Foundations',
      lessons: [
        {
          title: 'Introduction & Setup',
          videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
          duration: '15 min',
          isPreview: true
        }
      ]
    }
  ]
};

const initialBook = {
  title: '',
  author: '',
  category: '',
  description: '',
  pdfUrl: '',
  coverImage: ''
};

export default function AdminDashboard() {
  const currentUser = useAuthStore((state) => state.user);
  const [tab, setTab] = useState('overview');

  // Main entity states
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courseRequests, setCourseRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Form states
  const [courseForm, setCourseForm] = useState(initialCourse);
  const [editingCourse, setEditingCourse] = useState(null);
  const [bookForm, setBookForm] = useState(initialBook);
  const [bookFile, setBookFile] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', color: '#3b82f6' });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General', order: 0 });
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Load all platform data from MongoDB Atlas
  const loadAll = async () => {
    setLoading(true);
    try {
      const [
        analyticsData,
        courseData,
        bookData,
        userData,
        paymentData,
        categoryData,
        requestData,
        assignmentData,
        faqData,
        contactData
      ] = await Promise.all([
        api.get('/admin/analytics').catch(() => null),
        api.get('/courses?includeDrafts=true&limit=50').catch(() => ({ courses: [] })),
        api.get('/library/books?limit=50').catch(() => ({ books: [] })),
        api.get('/admin/users?limit=50').catch(() => ({ users: [] })),
        api.get('/admin/payments?limit=50').catch(() => ({ payments: [] })),
        api.get('/categories').catch(() => ({ categories: [] })),
        api.get('/course-requests').catch(() => ({ requests: [] })),
        api.get('/assignments').catch(() => ({ assignments: [] })),
        api.get('/faqs/admin').catch(() => ({ faqs: [] })),
        api.get('/contact').catch(() => ({ messages: [] }))
      ]);

      setAnalytics(analyticsData);
      setCourses(courseData.courses || []);
      setBooks(bookData.books || []);
      setUsers(userData.users || []);
      setPayments(paymentData.payments || []);
      setCategories(categoryData.categories || []);
      setCourseRequests(requestData.requests || []);
      setAssignments(assignmentData.assignments || []);
      setFaqs(faqData.faqs || []);
      setContacts(contactData.messages || []);
    } catch (err) {
      setMessage(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const chartData = useMemo(() => {
    if (!analytics?.monthlyRevenue?.length) {
      return [{ month: 'Current', revenue: 0 }];
    }
    return analytics.monthlyRevenue.map((item) => ({
      month: `${item._id.month}/${item._id.year}`,
      revenue: item.total
    }));
  }, [analytics]);

  const educators = useMemo(() => users.filter((u) => u.role === 'educator'), [users]);

  // Save course (create or update)
  const saveCourse = async (e) => {
    e.preventDefault();
    setMessage('');

    const payload = {
      ...courseForm,
      price: Number(courseForm.price),
      discountPrice: courseForm.discountPrice === '' ? undefined : Number(courseForm.discountPrice),
      tags: typeof courseForm.tags === 'string' ? courseForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : courseForm.tags,
      outcomes: typeof courseForm.outcomes === 'string' ? courseForm.outcomes.split('\n').map((o) => o.trim()).filter(Boolean) : courseForm.outcomes,
      requirements: typeof courseForm.requirements === 'string' ? courseForm.requirements.split('\n').map((r) => r.trim()).filter(Boolean) : courseForm.requirements,
      curriculum: courseForm.curriculum
    };

    try {
      if (editingCourse) {
        await api.patch(`/courses/${editingCourse}`, payload);
        setMessage('Course successfully updated.');
      } else {
        await api.post('/courses', payload);
        setMessage('New course published successfully.');
      }
      setCourseForm(initialCourse);
      setEditingCourse(null);
      await loadAll();
    } catch (err) {
      setMessage(err.message || 'Failed to save course.');
    }
  };

  // Populate form to edit a course
  const editCourse = (c) => {
    setEditingCourse(c._id);
    setCourseForm({
      title: c.title || '',
      subtitle: c.subtitle || '',
      description: c.description || '',
      category: c.category?._id || c.category || '',
      level: c.level || 'Beginner',
      price: c.price || 0,
      discountPrice: c.discountPrice !== undefined ? c.discountPrice : '',
      duration: c.duration || '8 hours',
      previewVideoUrl: c.previewVideoUrl || '',
      instructorOwner: c.instructorOwner?._id || c.instructorOwner || '',
      status: c.status || 'published',
      featured: Boolean(c.featured),
      tags: (c.tags || []).join(', '),
      outcomes: (c.outcomes || []).join('\n'),
      requirements: (c.requirements || []).join('\n'),
      curriculum: c.curriculum || []
    });
    setTab('courses');
  };

  // Delete course
  const removeCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setMessage('Course removed.');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Save PDF Book
  const saveBook = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      let payload = bookForm;
      let options;
      if (bookFile) {
        payload = new FormData();
        Object.entries(bookForm).forEach(([key, val]) => payload.append(key, val));
        payload.append('pdf', bookFile);
        options = {};
      }

      if (editingBook) {
        await api.patch(`/library/books/${editingBook}`, payload, options);
        setMessage('Book updated.');
      } else {
        await api.post('/library/books', payload, options);
        setMessage('PDF book added to library.');
      }
      setBookForm(initialBook);
      setBookFile(null);
      setEditingBook(null);
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Save new category
  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', categoryForm);
      setCategoryForm({ name: '', description: '', color: '#3b82f6' });
      setMessage('Category added.');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Update user role or library access
  const updateUser = async (id, patch) => {
    try {
      await api.patch(`/admin/users/${id}`, patch);
      setMessage('User updated.');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Assign course to educator
  const assignCourseToEducator = async (user, courseId) => {
    try {
      if (courseId) {
        await api.patch(`/courses/${courseId}`, { instructorOwner: user._id });
        const assigned = courses.find((c) => c._id === courseId);
        const subject = assigned?.category?.name || assigned?.category || '';
        if (subject && subject !== user.educatorSubject) {
          await api.patch(`/admin/users/${user._id}`, { educatorSubject: subject });
        }
      }
      setMessage('Course assigned to educator.');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Course request review
  const reviewCourseRequest = async (id, status) => {
    try {
      await api.patch(`/course-requests/${id}/review`, { status });
      setMessage(status === 'approved' ? 'Request approved.' : 'Request rejected.');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Grade student assignment submission
  const gradeSubmission = async (assignmentId, studentId) => {
    const key = `${assignmentId}:${studentId}`;
    const entry = marks[key] || {};
    try {
      await api.patch(`/assignments/${assignmentId}/submissions/${studentId}`, {
        marks: Number(entry.marks || 0),
        feedback: entry.feedback || ''
      });
      setMessage('Submission graded successfully.');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Create FAQ
  const saveFaq = async (e) => {
    e.preventDefault();
    try {
      await api.post('/faqs', faqForm);
      setFaqForm({ question: '', answer: '', category: 'General', order: 0 });
      setMessage('FAQ added to knowledge base.');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Delete FAQ
  const removeFaq = async (id) => {
    try {
      await api.delete(`/faqs/${id}`);
      setMessage('FAQ deleted.');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Update contact status
  const updateContact = async (id, status) => {
    try {
      await api.patch(`/contact/${id}`, { status });
      setMessage(`Inquiry marked as ${status}.`);
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Delete contact message
  const removeContact = async (id) => {
    try {
      await api.delete(`/contact/${id}`);
      setMessage('Inquiry deleted.');
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <Seo title="Admin Operations Center" description="Comprehensive platform management for LearnHub Academy." />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Admin Operations</p>
            <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Platform Control Center</h1>
          </div>
          <Button onClick={loadAll} variant="secondary" size="sm">
            <RefreshCw size={15} /> Refresh All
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 overflow-auto rounded-2xl bg-white/60 p-2 shadow-sm">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                tab === key
                  ? 'brand-gradient text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Status Message Notification */}
        {message && (
          <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-xs font-bold text-brand-800 shadow-sm flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-brand-600 hover:text-brand-800">
              Dismiss
            </button>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Total Users" value={analytics?.stats?.users || users.length} tone="brand" />
              <StatCard icon={BookOpen} label="Published Courses" value={analytics?.stats?.courses || courses.length} tone="mint" />
              <StatCard icon={FileText} label="Library Books" value={analytics?.stats?.books || books.length} tone="amber" />
              <StatCard icon={CreditCard} label="Gross Revenue" value={money(analytics?.stats?.revenue || 0)} tone="coral" />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <GlassCard className="p-6">
                <h2 className="text-xl font-black text-ink">Revenue Analytics</h2>
                <div className="mt-6 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.12)" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip formatter={(val) => money(val)} />
                      <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revenueGrad)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h2 className="text-xl font-black text-ink">AI Tutor Activity</h2>
                <div className="mt-6 space-y-3">
                  {analytics?.aiUsage?.length ? (
                    analytics.aiUsage.map((item) => (
                      <div key={item._id} className="flex items-center justify-between rounded-xl bg-white/70 p-3.5 border border-slate-100">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <WandSparkles size={16} className="text-brand-600" />
                          <span>{item._id}</span>
                        </span>
                        <span className="font-mono text-sm font-black text-ink">{item.count} calls</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted">AI usage counts appear as students ask doubts.</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* 2. COURSES TAB */}
        {tab === 'courses' && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Visual Course Editor Form */}
            <GlassCard className="p-6 shadow-sm">
              <h2 className="text-xl font-black text-ink">
                {editingCourse ? 'Edit Masterclass' : 'Create New Masterclass'}
              </h2>
              <p className="mt-1 text-xs text-muted">
                Build your course curriculum visually. No raw JSON editing needed.
              </p>

              <form onSubmit={saveCourse} className="mt-6 space-y-4">
                <input
                  required
                  placeholder="Masterclass Title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 text-sm font-bold outline-none focus:border-brand-500"
                />

                <input
                  placeholder="Short Subtitle / Tagline"
                  value={courseForm.subtitle}
                  onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 text-sm outline-none focus:border-brand-500"
                />

                <textarea
                  required
                  rows={4}
                  placeholder="Detailed course description, architectural scope, and skills covered..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white/80 p-3.5 text-sm outline-none focus:border-brand-500"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    required
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="number"
                    placeholder="Regular Price (INR)"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Discount Price"
                    value={courseForm.discountPrice}
                    onChange={(e) => setCourseForm({ ...courseForm, discountPrice: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                  />
                  <input
                    placeholder="Total Duration (e.g. 18 hours)"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                  />
                </div>

                <input
                  placeholder="Preview YouTube Video URL"
                  value={courseForm.previewVideoUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, previewVideoUrl: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 text-sm outline-none"
                />

                <select
                  value={courseForm.instructorOwner}
                  onChange={(e) => setCourseForm({ ...courseForm, instructorOwner: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                >
                  <option value="">Assign Lead Educator / Mentor</option>
                  {educators.map((edu) => (
                    <option key={edu._id} value={edu._id}>
                      {edu.name} ({edu.educatorSubject || 'Software Engineering'})
                    </option>
                  ))}
                </select>

                {/* Outcomes & Requirements */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Learning Outcomes (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={courseForm.outcomes}
                      onChange={(e) => setCourseForm({ ...courseForm, outcomes: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white/80 p-2.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Requirements (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={courseForm.requirements}
                      onChange={(e) => setCourseForm({ ...courseForm, requirements: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white/80 p-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Visual Curriculum Builder */}
                <CurriculumBuilder
                  modules={courseForm.curriculum}
                  onChange={(updatedModules) => setCourseForm({ ...courseForm, curriculum: updatedModules })}
                />

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={courseForm.featured}
                      onChange={(e) => setCourseForm({ ...courseForm, featured: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                    <span>Feature on Landing Page</span>
                  </label>

                  <select
                    value={courseForm.status}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button>{editingCourse ? 'Save Changes' : 'Publish Masterclass'}</Button>
                  {editingCourse && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingCourse(null);
                        setCourseForm(initialCourse);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </GlassCard>

            {/* Courses List */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-ink">Catalog Masterclasses ({courses.length})</h2>

              {courses.map((c) => (
                <GlassCard key={c._id} className="p-4 border border-slate-100 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
                        {c.category?.name || 'General'}
                      </span>
                      <h3 className="text-base font-black text-ink mt-0.5">{c.title}</h3>
                      <p className="mt-1 text-xs text-muted">
                        Mentor: {c.instructorOwner?.name || c.instructor?.name || 'Unassigned'} &bull; {c.duration}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-700">
                        Price: {money(c.discountPrice || c.price)} &bull; {c.status}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => editCourse(c)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => removeCourse(c._id)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* 3. LIBRARY TAB */}
        {tab === 'library' && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[400px_1fr]">
            <GlassCard className="p-6">
              <h2 className="text-xl font-black text-ink">{editingBook ? 'Edit Book' : 'Add PDF Book'}</h2>
              <form onSubmit={saveBook} className="mt-5 space-y-3 text-sm">
                <input
                  required
                  placeholder="Book Title"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 px-3 outline-none"
                />
                <input
                  required
                  placeholder="Author"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 px-3 outline-none"
                />
                <input
                  required
                  placeholder="Category (e.g. Full Stack)"
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 px-3 outline-none"
                />
                <input
                  placeholder="PDF URL (or upload below)"
                  value={bookForm.pdfUrl}
                  onChange={(e) => setBookForm({ ...bookForm, pdfUrl: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 px-3 outline-none"
                />
                <input
                  placeholder="Cover Image URL"
                  value={bookForm.coverImage}
                  onChange={(e) => setBookForm({ ...bookForm, coverImage: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 px-3 outline-none"
                />
                <textarea
                  rows={3}
                  placeholder="Book Summary"
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white/80 p-3 outline-none"
                />
                <Button>{editingBook ? 'Save Book' : 'Create Book'}</Button>
              </form>
            </GlassCard>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-ink">PDF Books ({books.length})</h2>
              {books.map((b) => (
                <GlassCard key={b._id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-ink">{b.title}</h3>
                    <p className="text-xs text-muted">Author: {b.author} &bull; Category: {b.category}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      await api.delete(`/library/books/${b._id}`);
                      await loadAll();
                    }}
                  >
                    <Trash2 size={15} />
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* 4. USERS TAB */}
        {tab === 'users' && (
          <GlassCard className="mt-8 p-6 overflow-hidden">
            <h2 className="text-xl font-black text-ink mb-4">User Roles & Educator Assignments</h2>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead className="text-xs uppercase tracking-wider text-muted border-b border-slate-200">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Assigned Course</th>
                    <th className="p-3">Library</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = currentUser?._id === u._id;
                    return (
                      <tr key={u._id} className="border-b border-slate-100">
                        <td className="p-3">
                          <p className="font-bold text-ink">{u.name}</p>
                          <p className="text-xs text-muted">{u.email}</p>
                        </td>
                        <td className="p-3">
                          {isSelf ? (
                            <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">Admin (You)</span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => updateUser(u._id, { role: e.target.value })}
                              className="rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold"
                            >
                              <option value="student">student</option>
                              <option value="educator">educator</option>
                            </select>
                          )}
                        </td>
                        <td className="p-3">
                          {u.role === 'educator' ? (
                            <select
                              onChange={(e) => assignCourseToEducator(u, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold w-48"
                            >
                              <option value="">Assign Course...</option>
                              {courses.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-muted">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={u.libraryAccess ? 'enabled' : 'disabled'}
                            onChange={(e) => updateUser(u._id, { libraryAccess: e.target.value === 'enabled' })}
                            className="rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold"
                          >
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </td>
                        <td className="p-3">
                          {!isSelf && (
                            <button
                              onClick={async () => {
                                if (!window.confirm(`Delete user ${u.name}?`)) return;
                                await api.delete(`/admin/users/${u._id}`);
                                await loadAll();
                              }}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* 5. REQUESTS TAB */}
        {tab === 'requests' && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-black text-ink">Educator Course Proposals</h2>
            {courseRequests.length > 0 ? (
              courseRequests.map((req) => (
                <GlassCard key={req._id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 uppercase">
                        {req.status}
                      </span>
                      <h3 className="text-lg font-black text-ink mt-2">{req.payload?.title}</h3>
                      <p className="text-xs text-muted">Submitted by {req.educator?.name} ({req.educator?.email})</p>
                      <p className="mt-3 text-sm text-slate-700 max-w-2xl">{req.payload?.description}</p>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => reviewCourseRequest(req._id, 'approved')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => reviewCourseRequest(req._id, 'rejected')}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-8 text-center text-muted">No pending educator proposals.</GlassCard>
            )}
          </div>
        )}

        {/* 6. ASSIGNMENTS TAB */}
        {tab === 'assignments' && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-black text-ink">Assignment Submissions Grading</h2>
            {assignments.map((ass) => (
              <GlassCard key={ass._id} className="p-6 space-y-4">
                <h3 className="text-lg font-black text-ink">{ass.title}</h3>
                <p className="text-xs text-muted">Course: {ass.course?.title} &bull; Max Marks: {ass.maxMarks}</p>

                <div className="overflow-auto">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead className="border-b border-slate-200 text-muted">
                      <tr>
                        <th className="p-2">Student</th>
                        <th className="p-2">Response</th>
                        <th className="p-2">Score</th>
                        <th className="p-2">Feedback</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ass.roster || []).map((student) => {
                        const sub = ass.submissions?.find((s) => s.student?._id === student._id);
                        const key = `${ass._id}:${student._id}`;
                        return (
                          <tr key={student._id} className="border-b border-slate-100">
                            <td className="p-2 font-bold text-ink">{student.name}</td>
                            <td className="p-2 max-w-xs truncate text-muted">{sub?.answer || 'Pending'}</td>
                            <td className="p-2">
                              <input
                                type="number"
                                defaultValue={sub?.marks ?? ''}
                                onChange={(e) => setMarks({ ...marks, [key]: { ...marks[key], marks: e.target.value } })}
                                className="h-8 w-18 rounded border border-slate-200 px-2 font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                defaultValue={sub?.feedback || ''}
                                onChange={(e) => setMarks({ ...marks, [key]: { ...marks[key], feedback: e.target.value } })}
                                className="h-8 w-36 rounded border border-slate-200 px-2"
                              />
                            </td>
                            <td className="p-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => gradeSubmission(ass._id, student._id)}
                                disabled={!sub}
                              >
                                Save
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* 7. FAQS MANAGEMENT TAB (NEW) */}
        {tab === 'faqs' && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[400px_1fr]">
            <GlassCard className="p-6">
              <h2 className="text-xl font-black text-ink">Add New FAQ</h2>
              <form onSubmit={saveFaq} className="mt-5 space-y-3 text-sm">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Question</label>
                  <input
                    required
                    placeholder="e.g. How does course access work?"
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 px-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 px-3 font-semibold outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Courses">Courses</option>
                    <option value="Payments & Billing">Payments & Billing</option>
                    <option value="AI Tutor">AI Tutor</option>
                    <option value="Certificates">Certificates</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Answer</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a clear, detailed answer..."
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white/80 p-3 outline-none"
                  />
                </div>

                <Button>
                  <Plus size={15} /> Add FAQ
                </Button>
              </form>
            </GlassCard>

            <div className="space-y-3">
              <h2 className="text-xl font-black text-ink">Knowledge Base FAQs ({faqs.length})</h2>
              {faqs.map((f) => (
                <GlassCard key={f._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded bg-brand-50 px-2 py-0.5 text-[11px] font-black uppercase text-brand-700">
                        {f.category}
                      </span>
                      <h4 className="font-extrabold text-ink text-sm mt-1">{f.question}</h4>
                      <p className="mt-1 text-xs text-muted leading-relaxed">{f.answer}</p>
                    </div>
                    <button
                      onClick={() => removeFaq(f._id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Delete FAQ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* 8. CONTACT INQUIRIES TAB (NEW) */}
        {tab === 'contacts' && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-black text-ink">Student Contact Inquiries ({contacts.length})</h2>

            {contacts.length > 0 ? (
              contacts.map((msg) => (
                <GlassCard key={msg._id} className="p-6 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                          msg.status === 'new'
                            ? 'bg-emerald-100 text-emerald-800'
                            : msg.status === 'read'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {msg.status}
                      </span>
                      <h3 className="text-base font-black text-ink mt-1">{msg.subject}</h3>
                      <p className="text-xs text-muted">
                        From: <strong className="text-slate-800">{msg.name}</strong> ({msg.email}) &bull;{' '}
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {msg.status !== 'resolved' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateContact(msg._id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => removeContact(msg._id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-700 bg-slate-50/70 p-3.5 rounded-xl">
                    {msg.message}
                  </p>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-10 text-center text-muted">No student inquiries received yet.</GlassCard>
            )}
          </div>
        )}

        {/* 9. PAYMENTS TAB */}
        {tab === 'payments' && (
          <GlassCard className="mt-8 p-6 overflow-hidden">
            <h2 className="text-xl font-black text-ink mb-4">Payment Transactions ({payments.length})</h2>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead className="text-xs uppercase tracking-wider text-muted border-b border-slate-200">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Learner</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-slate-100">
                      <td className="p-3 font-mono text-xs">{p.orderId}</td>
                      <td className="p-3 font-bold text-ink">{p.user?.name || 'Student'}</td>
                      <td className="p-3 text-muted text-xs capitalize">{p.type}</td>
                      <td className="p-3 font-black text-ink">{money(p.amount)}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </section>
    </>
  );
}
