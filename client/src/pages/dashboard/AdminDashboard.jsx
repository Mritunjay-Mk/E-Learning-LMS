import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, CheckCircle2, ClipboardList, CreditCard, FileText, LayoutDashboard, Plus, Trash2, Users, WandSparkles, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import StatCard from '../../components/common/StatCard';
import { api } from '../../api/client';
import { money } from '../../utils/format';

const tabs = [
  ['overview', 'Overview', LayoutDashboard],
  ['courses', 'Courses', BookOpen],
  ['library', 'Library', FileText],
  ['users', 'Users', Users],
  ['requests', 'Requests', ClipboardList],
  ['assignments', 'Assignments', CheckCircle2],
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
  duration: '6 hours',
  previewVideoUrl: '',
  instructorOwner: '',
  status: 'published',
  featured: false,
  tags: '["AI","MERN"]',
  outcomes: '["Build a production feature","Deploy with confidence"]',
  requirements: '["JavaScript basics"]',
  curriculum:
    '[{"title":"Module 1","lessons":[{"title":"Introduction","videoUrl":"https://www.youtube.com/watch?v=7CqJlxBYj-M","duration":"12 min","isPreview":true}]}]'
};

const initialBook = {
  title: '',
  author: '',
  category: '',
  description: '',
  pdfUrl: '',
  coverImage: ''
};

const fetchAdminCourses = async () => {
  const firstPage = await api.get('/courses?includeDrafts=true&limit=50');
  const totalPages = firstPage.pagination?.pages || 1;
  if (totalPages <= 1) return firstPage;

  const restPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => api.get(`/courses?includeDrafts=true&limit=50&page=${index + 2}`))
  );
  return {
    ...firstPage,
    courses: [firstPage, ...restPages].flatMap((page) => page.courses || [])
  };
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courseRequests, setCourseRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courseForm, setCourseForm] = useState(initialCourse);
  const [bookForm, setBookForm] = useState(initialBook);
  const [bookFile, setBookFile] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', color: '#5b7cfa' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState('');

  const loadAll = async () => {
    const [analyticsData, courseData, bookData, userData, paymentData, categoryData, requestData, assignmentData] = await Promise.all([
      api.get('/admin/analytics'),
      fetchAdminCourses(),
      api.get('/library/books?limit=50'),
      api.get('/admin/users?limit=50'),
      api.get('/admin/payments?limit=50'),
      api.get('/categories'),
      api.get('/course-requests'),
      api.get('/assignments')
    ]);
    setAnalytics(analyticsData);
    setCourses(courseData.courses);
    setBooks(bookData.books);
    setUsers(userData.users);
    setPayments(paymentData.payments);
    setCategories(categoryData.categories);
    setCourseRequests(requestData.requests || []);
    setAssignments(assignmentData.assignments || []);
  };

  useEffect(() => {
    loadAll().catch((error) => setMessage(error.message));
  }, []);

  const chartData = useMemo(
    () =>
      analytics?.monthlyRevenue?.length
        ? analytics.monthlyRevenue.map((item) => ({
            month: `${item._id.month}/${item._id.year}`,
            revenue: item.total
          }))
        : [{ month: 'Now', revenue: 0 }],
    [analytics]
  );
  const educators = useMemo(() => users.filter((user) => user.role === 'educator'), [users]);

  const parseJson = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const saveCourse = async (event) => {
    event.preventDefault();
    setMessage('');
    const payload = {
      ...courseForm,
      price: Number(courseForm.price),
      discountPrice: courseForm.discountPrice === '' ? undefined : Number(courseForm.discountPrice),
      tags: parseJson(courseForm.tags, []),
      outcomes: parseJson(courseForm.outcomes, []),
      requirements: parseJson(courseForm.requirements, []),
      curriculum: parseJson(courseForm.curriculum, [])
    };
    try {
      if (editingCourse) {
        await api.patch(`/courses/${editingCourse}`, payload);
        setMessage('Course updated.');
      } else {
        await api.post('/courses', payload);
        setMessage('Course created.');
      }
      setCourseForm(initialCourse);
      setEditingCourse(null);
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editCourse = (course) => {
    setEditingCourse(course._id);
    setCourseForm({
      title: course.title || '',
      subtitle: course.subtitle || '',
      description: course.description || '',
      category: course.category?._id || course.category?.name || '',
      level: course.level || 'Beginner',
      price: course.price || 0,
      discountPrice: course.discountPrice || '',
      duration: course.duration || '6 hours',
      previewVideoUrl: course.previewVideoUrl || '',
      instructorOwner: course.instructorOwner?._id || course.instructorOwner || '',
      status: course.status || 'published',
      featured: Boolean(course.featured),
      tags: JSON.stringify(course.tags || []),
      outcomes: JSON.stringify(course.outcomes || []),
      requirements: JSON.stringify(course.requirements || []),
      curriculum: JSON.stringify(course.curriculum || [])
    });
    setTab('courses');
  };

  const removeCourse = async (id) => {
    await api.delete(`/courses/${id}`);
    await loadAll();
  };

  const saveBook = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      let payload = bookForm;
      let options;
      if (bookFile) {
        payload = new FormData();
        Object.entries(bookForm).forEach(([key, value]) => payload.append(key, value));
        payload.append('pdf', bookFile);
        options = {};
      }
      if (editingBook) {
        await api.patch(`/library/books/${editingBook}`, payload, options);
        setMessage('Book updated.');
      } else {
        await api.post('/library/books', payload, options);
        setMessage('Book created.');
      }
      setBookForm(initialBook);
      setBookFile(null);
      setEditingBook(null);
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editBook = (book) => {
    setEditingBook(book._id);
    setBookForm({
      title: book.title || '',
      author: book.author || '',
      category: book.category || '',
      description: book.description || '',
      pdfUrl: book.pdfUrl || '',
      coverImage: book.coverImage || ''
    });
    setBookFile(null);
    setTab('library');
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    await api.post('/categories', categoryForm);
    setCategoryForm({ name: '', description: '', color: '#5b7cfa' });
    await loadAll();
  };

  const updateUser = async (id, patch) => {
    await api.patch(`/admin/users/${id}`, patch);
    await loadAll();
  };

  const assignedCourseFor = (user) => courses.find((course) => String(course.instructorOwner?._id || course.instructorOwner || '') === String(user._id));

  const assignCourseToEducator = async (user, courseId) => {
    setMessage('');
    try {
      const currentCourse = assignedCourseFor(user);
      if (currentCourse && currentCourse._id !== courseId) {
        await api.patch(`/courses/${currentCourse._id}`, { instructorOwner: '' });
      }
      if (courseId) {
        const nextCourse = courses.find((course) => course._id === courseId);
        await api.patch(`/courses/${courseId}`, { instructorOwner: user._id });
        const subject = nextCourse?.category?.name || nextCourse?.category || '';
        if (subject && subject !== user.educatorSubject) {
          await api.patch(`/admin/users/${user._id}`, { educatorSubject: subject });
        }
      }
      setMessage(courseId ? 'Course assigned to educator.' : 'Course assignment removed.');
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const reviewCourseRequest = async (id, status) => {
    setMessage('');
    try {
      await api.patch(`/course-requests/${id}/review`, { status });
      setMessage(status === 'approved' ? 'Course request approved.' : 'Course request rejected.');
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const gradeSubmission = async (assignmentId, studentId) => {
    const key = `${assignmentId}:${studentId}`;
    const value = marks[key] || {};
    try {
      await api.patch(`/assignments/${assignmentId}/submissions/${studentId}`, {
        marks: Number(value.marks || 0),
        feedback: value.feedback || ''
      });
      setMessage('Assignment marks saved.');
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <>
      <Seo title="Admin Dashboard" description="Manage LearnHub AI LMS analytics, courses, PDFs, payments, users, and AI usage." />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">Admin Dashboard</p>
            <h1 className="mt-3 text-4xl font-black text-ink">Operations center</h1>
          </div>
          <Button onClick={loadAll} variant="secondary">
            Refresh
          </Button>
        </div>

        <div className="mt-8 flex gap-2 overflow-auto rounded-2xl bg-white/50 p-2">
          {tabs.map(([key, label, Icon]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${tab === key ? 'brand-gradient text-white shadow-glow' : 'text-slate-700 hover:bg-white'}`}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        {message && <p className="mt-4 rounded-xl bg-white/75 p-4 text-sm font-bold text-slate-700">{message}</p>}

        {tab === 'overview' && (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Users" value={analytics?.stats?.users || 0} tone="brand" />
              <StatCard icon={BookOpen} label="Courses" value={analytics?.stats?.courses || 0} tone="mint" />
              <StatCard icon={FileText} label="Books" value={analytics?.stats?.books || 0} tone="amber" />
              <StatCard icon={CreditCard} label="Revenue" value={money(analytics?.stats?.revenue || 0)} tone="coral" />
            </div>
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <GlassCard className="p-5">
                <h2 className="text-2xl font-black text-ink">Revenue</h2>
                <div className="mt-5 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5b7cfa" stopOpacity={0.55} />
                          <stop offset="95%" stopColor="#12b886" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.18)" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => money(value)} />
                      <Area type="monotone" dataKey="revenue" stroke="#435ee8" fill="url(#revenue)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
              <GlassCard className="p-5">
                <h2 className="text-2xl font-black text-ink">AI analytics</h2>
                <div className="mt-5 grid gap-3">
                  {analytics?.aiUsage?.length ? (
                    analytics.aiUsage.map((item) => (
                      <div key={item._id} className="flex items-center justify-between rounded-xl bg-white/60 p-3">
                        <span className="flex items-center gap-2 font-bold text-slate-700">
                          <WandSparkles size={17} className="text-brand-600" /> {item._id}
                        </span>
                        <span className="font-black text-ink">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted">AI usage appears after students generate tutor responses.</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {tab === 'courses' && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
            <GlassCard className="h-max p-5">
              <h2 className="text-2xl font-black text-ink">{editingCourse ? 'Edit course' : 'Add course'}</h2>
              <form onSubmit={saveCourse} className="mt-5 grid gap-3">
                <input required placeholder="Title" value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                <input placeholder="Subtitle" value={courseForm.subtitle} onChange={(event) => setCourseForm({ ...courseForm, subtitle: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                <textarea required rows={4} placeholder="Description" value={courseForm.description} onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })} className="rounded-xl border border-white/80 bg-white/75 p-3 outline-none" />
                <select value={courseForm.category} onChange={(event) => setCourseForm({ ...courseForm, category: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" required>
                  <option value="">Choose category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select value={courseForm.level} onChange={(event) => setCourseForm({ ...courseForm, level: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <input placeholder="Duration" value={courseForm.duration} onChange={(event) => setCourseForm({ ...courseForm, duration: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="number" placeholder="Price" value={courseForm.price} onChange={(event) => setCourseForm({ ...courseForm, price: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                  <input type="number" placeholder="Discount price" value={courseForm.discountPrice} onChange={(event) => setCourseForm({ ...courseForm, discountPrice: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                </div>
                <input placeholder="YouTube preview URL" value={courseForm.previewVideoUrl} onChange={(event) => setCourseForm({ ...courseForm, previewVideoUrl: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                <select value={courseForm.instructorOwner} onChange={(event) => setCourseForm({ ...courseForm, instructorOwner: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none">
                  <option value="">Assign educator</option>
                  {educators.map((educator) => (
                    <option key={educator._id} value={educator._id}>
                      {educator.name} {educator.educatorSubject ? `- ${educator.educatorSubject}` : ''}
                    </option>
                  ))}
                </select>
                <textarea rows={3} value={courseForm.curriculum} onChange={(event) => setCourseForm({ ...courseForm, curriculum: event.target.value })} className="rounded-xl border border-white/80 bg-white/75 p-3 font-mono text-xs outline-none" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-sm font-bold">
                    <input type="checkbox" checked={courseForm.featured} onChange={(event) => setCourseForm({ ...courseForm, featured: event.target.checked })} /> Featured
                  </label>
                  <select value={courseForm.status} onChange={(event) => setCourseForm({ ...courseForm, status: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <Button>
                  <Plus size={17} /> {editingCourse ? 'Save Course' : 'Create Course'}
                </Button>
              </form>
            </GlassCard>

            <div className="grid gap-4">
              <GlassCard className="p-5">
                <h2 className="text-xl font-black text-ink">Categories</h2>
                <form onSubmit={saveCategory} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <input required placeholder="Category name" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                  <input placeholder="Description" value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                  <Button>Create</Button>
                </form>
              </GlassCard>
              {courses.map((course) => (
                <GlassCard key={course._id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">{course.category?.name}</p>
                      <h3 className="text-xl font-black text-ink">{course.title}</h3>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Educator: {course.instructorOwner?.name || course.instructor?.name || 'Not assigned'}
                      </p>
                      <p className="mt-1 text-sm text-muted">{course.status} • {money(course.discountPrice || course.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={() => editCourse(course)}>
                        Edit
                      </Button>
                      <Button type="button" variant="danger" onClick={() => removeCourse(course._id)}>
                        <Trash2 size={17} />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {tab === 'library' && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
            <GlassCard className="h-max p-5">
              <h2 className="text-2xl font-black text-ink">{editingBook ? 'Edit book' : 'Add PDF book'}</h2>
              <form onSubmit={saveBook} className="mt-5 grid gap-3">
                {[
                  ['title', 'Title'],
                  ['author', 'Author'],
                  ['category', 'Category'],
                  ['pdfUrl', 'PDF URL'],
                  ['coverImage', 'Cover image URL']
                ].map(([key, label]) => (
                  <input key={key} required={!['coverImage', 'pdfUrl'].includes(key)} placeholder={label} value={bookForm[key]} onChange={(event) => setBookForm({ ...bookForm, [key]: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                ))}
                <label className="rounded-xl bg-white/60 p-3 text-sm font-bold text-slate-700">
                  Upload PDF
                  <input type="file" accept="application/pdf" onChange={(event) => setBookFile(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" />
                </label>
                <textarea rows={4} placeholder="Description" value={bookForm.description} onChange={(event) => setBookForm({ ...bookForm, description: event.target.value })} className="rounded-xl border border-white/80 bg-white/75 p-3 outline-none" />
                <Button>{editingBook ? 'Save Book' : 'Create Book'}</Button>
              </form>
            </GlassCard>
            <div className="grid gap-4">
              {books.map((book) => (
                <GlassCard key={book._id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">{book.category}</p>
                      <h3 className="text-xl font-black text-ink">{book.title}</h3>
                      <p className="mt-1 text-sm text-muted">{book.author} • {book.downloads || 0} downloads</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={() => editBook(book)}>
                        Edit
                      </Button>
                      <Button type="button" variant="danger" onClick={async () => { await api.delete(`/library/books/${book._id}`); await loadAll(); }}>
                        <Trash2 size={17} />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <GlassCard className="mt-8 overflow-hidden p-4">
            <div className="mb-4 rounded-2xl bg-white/60 p-4">
              <h2 className="text-lg font-black text-ink">Educator setup</h2>
              <p className="mt-1 text-sm font-semibold text-muted">
                Educators register with the normal Register page first. Then set their role to educator and assign a course from this table.
              </p>
            </div>
            <div className="overflow-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-muted">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Library</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const assignedCourse = assignedCourseFor(user);
                    return (
                    <tr key={user._id} className="border-t border-white/70">
                      <td className="p-3 font-bold text-ink">
                        {user.name}
                        <span className="block text-xs font-semibold text-muted">{user.email}</span>
                      </td>
                      <td className="p-3">
                        <select value={user.role} onChange={(event) => updateUser(user._id, { role: event.target.value })} className="rounded-xl bg-white/70 px-3 py-2 font-bold">
                          <option value="student">student</option>
                          <option value="educator">educator</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="p-3">
                        {user.role === 'educator' ? (
                          <select value={assignedCourse?._id || ''} onChange={(event) => assignCourseToEducator(user, event.target.value)} className="h-10 w-56 rounded-xl bg-white/70 px-3 text-sm font-bold outline-none">
                            <option value="">No course assigned</option>
                            {courses.map((course) => (
                              <option key={course._id} value={course._id}>
                                {course.title}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm font-bold text-muted">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <select value={user.libraryAccess ? 'enabled' : 'disabled'} onChange={(event) => updateUser(user._id, { libraryAccess: event.target.value === 'enabled' })} className="h-10 rounded-xl bg-white/70 px-3 text-sm font-bold text-slate-700 outline-none">
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </td>
                      <td className="p-3 text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <Button
                          type="button"
                          variant="danger"
                          onClick={async () => {
                            await api.delete(`/admin/users/${user._id}`);
                            await loadAll();
                          }}
                        >
                          <Trash2 size={17} />
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {tab === 'requests' && (
          <div className="mt-8 grid gap-4">
            {courseRequests.length ? (
              courseRequests.map((request) => (
                <GlassCard key={request._id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">{request.status}</p>
                      <h2 className="mt-1 text-2xl font-black text-ink">{request.payload?.title}</h2>
                      <p className="mt-2 text-sm font-semibold text-muted">
                        {request.educator?.name} | {request.educator?.email}
                      </p>
                      <p className="mt-3 max-w-3xl text-sm text-slate-600">{request.payload?.description}</p>
                      {request.course && <p className="mt-2 text-sm font-bold text-emerald-700">Created course: {request.course.title}</p>}
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button type="button" onClick={() => reviewCourseRequest(request._id, 'approved')}>
                          <CheckCircle2 size={17} /> Approve
                        </Button>
                        <Button type="button" variant="danger" onClick={() => reviewCourseRequest(request._id, 'rejected')}>
                          <XCircle size={17} /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-8 text-center">
                <p className="font-bold text-muted">No course requests yet.</p>
              </GlassCard>
            )}
          </div>
        )}

        {tab === 'assignments' && (
          <div className="mt-8 grid gap-4">
            {assignments.length ? (
              assignments.map((assignment) => (
                <GlassCard key={assignment._id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">{assignment.course?.title}</p>
                      <h2 className="mt-1 text-2xl font-black text-ink">{assignment.title}</h2>
                      <p className="mt-2 text-sm font-semibold text-muted">Educator: {assignment.educator?.name} | Max marks: {assignment.maxMarks}</p>
                    </div>
                  </div>
                  <div className="mt-5 overflow-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.16em] text-muted">
                        <tr>
                          <th className="p-3">Student</th>
                          <th className="p-3">Response</th>
                          <th className="p-3">Marks</th>
                          <th className="p-3">Feedback</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(assignment.roster || []).map((student) => {
                          const submission = assignment.submissions?.find((item) => item.student?._id === student._id);
                          const key = `${assignment._id}:${student._id}`;
                          return (
                            <tr key={student._id} className="border-t border-white/70">
                              <td className="p-3 font-bold text-ink">
                                {student.name}
                                <span className="block text-xs text-muted">{student.email}</span>
                              </td>
                              <td className="max-w-sm p-3 text-muted">{submission?.answer || 'Not submitted'}</td>
                              <td className="p-3">
                                <input type="number" min="0" max={assignment.maxMarks} defaultValue={submission?.marks ?? ''} onChange={(event) => setMarks({ ...marks, [key]: { ...marks[key], marks: event.target.value } })} className="h-10 w-24 rounded-xl bg-white/70 px-3 font-bold outline-none" />
                              </td>
                              <td className="p-3">
                                <input defaultValue={submission?.feedback || ''} onChange={(event) => setMarks({ ...marks, [key]: { ...marks[key], feedback: event.target.value } })} className="h-10 w-44 rounded-xl bg-white/70 px-3 font-bold outline-none" />
                              </td>
                              <td className="p-3">
                                <Button type="button" variant="secondary" onClick={() => gradeSubmission(assignment._id, student._id)} disabled={!submission}>
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
              ))
            ) : (
              <GlassCard className="p-8 text-center">
                <p className="font-bold text-muted">No assignments yet.</p>
              </GlassCard>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <GlassCard className="mt-8 overflow-hidden p-4">
            <div className="overflow-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-muted">
                  <tr>
                    <th className="p-3">Order</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-t border-white/70">
                      <td className="p-3 font-mono text-xs text-slate-700">{payment.orderId}</td>
                      <td className="p-3 font-bold text-ink">{payment.user?.name || 'User'}</td>
                      <td className="p-3 text-muted">{payment.type}</td>
                      <td className="p-3 font-black text-ink">{money(payment.amount)}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black text-slate-700">{payment.status}</span>
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
