import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardList, Edit, Plus, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import StatCard from '../../components/common/StatCard';
import { api } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { money } from '../../utils/format';

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
  status: 'published',
  tags: '[]',
  outcomes: '[]',
  requirements: '[]',
  curriculum: '[{"title":"Module 1","lessons":[{"title":"Introduction","videoUrl":"https://www.youtube.com/watch?v=7CqJlxBYj-M","duration":"12 min","isPreview":true}]}]'
};

const initialAssignment = {
  course: '',
  title: '',
  instructions: '',
  dueDate: '',
  maxMarks: 100
};

export default function EducatorDashboard() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizReports, setQuizReports] = useState([]);
  const [courseForm, setCourseForm] = useState(initialCourse);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment);
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState('');

  const subject = user?.educatorSubject || '';
  const subjectCategories = useMemo(() => {
    if (!subject) return categories;
    const normalized = subject.toLowerCase();
    return categories.filter((category) => [category.name, category.slug].some((value) => value?.toLowerCase() === normalized));
  }, [categories, subject]);

  const loadAll = async () => {
    const [courseData, categoryData, requestData, assignmentData, reportData] = await Promise.all([
      api.get('/courses?includeDrafts=true&limit=50'),
      api.get('/categories'),
      api.get('/course-requests/mine'),
      api.get('/assignments'),
      api.get('/module-quizzes/reports')
    ]);
    setCourses(courseData.courses || []);
    setCategories(categoryData.categories || []);
    setRequests(requestData.requests || []);
    setAssignments(assignmentData.assignments || []);
    setQuizReports(reportData.reports || []);
  };

  useEffect(() => {
    loadAll().catch((error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!courseForm.category && subjectCategories.length === 1) {
      setCourseForm((value) => ({ ...value, category: subjectCategories[0]._id }));
    }
  }, [courseForm.category, subjectCategories]);

  useEffect(() => {
    if (!assignmentForm.course && courses.length) {
      setAssignmentForm((value) => ({ ...value, course: courses[0]._id }));
    }
  }, [assignmentForm.course, courses]);

  const parseJson = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const requestCourse = async (event) => {
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
      await api.post('/course-requests', payload);
      setMessage('Course request sent to admin.');
      setCourseForm({ ...initialCourse, category: subjectCategories[0]?._id || '' });
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveAssignment = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/assignments', { ...assignmentForm, maxMarks: Number(assignmentForm.maxMarks || 100) });
      setMessage('Assignment added.');
      setAssignmentForm({ ...initialAssignment, course: courses[0]?._id || '' });
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const grade = async (assignmentId, studentId, maxMarks) => {
    const key = `${assignmentId}:${studentId}`;
    const value = marks[key] || {};
    await api.patch(`/assignments/${assignmentId}/submissions/${studentId}`, {
      marks: Number(value.marks || 0),
      feedback: value.feedback || ''
    });
    setMessage(`Marks saved out of ${maxMarks}.`);
    await loadAll();
  };

  const publishedCount = courses.filter((course) => course.status === 'published').length;
  const pendingRequests = requests.filter((request) => request.status === 'pending').length;
  const totalValue = courses.reduce((total, course) => total + Number(course.discountPrice || course.price || 0), 0);

  return (
    <>
      <Seo title="Educator Dashboard" description="Request courses and manage assignments for assigned LearnHub AI LMS courses." />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">Educator Dashboard</p>
            <h1 className="mt-3 text-4xl font-black text-ink">Course studio</h1>
            <p className="mt-2 text-sm font-bold text-muted">Subject: {subject || 'Not assigned'}</p>
          </div>
          <Button onClick={loadAll} variant="secondary">
            <RefreshCw size={17} /> Refresh
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="Assigned Courses" value={courses.length} tone="brand" />
          <StatCard icon={CheckCircle2} label="Published" value={publishedCount} tone="mint" />
          <StatCard icon={Edit} label="Pending Requests" value={pendingRequests} tone="amber" />
          <StatCard icon={ClipboardList} label="Assignments" value={assignments.length} tone="coral" />
        </div>

        {message && <p className="mt-4 rounded-xl bg-white/75 p-4 text-sm font-bold text-slate-700">{message}</p>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <GlassCard className="h-max p-5">
            <h2 className="text-2xl font-black text-ink">Request course</h2>
            <form onSubmit={requestCourse} className="mt-5 grid gap-3">
              <input required placeholder="Title" value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
              <input placeholder="Subtitle" value={courseForm.subtitle} onChange={(event) => setCourseForm({ ...courseForm, subtitle: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
              <textarea required rows={4} placeholder="Description" value={courseForm.description} onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })} className="rounded-xl border border-white/80 bg-white/75 p-3 outline-none" />
              <select value={courseForm.category} onChange={(event) => setCourseForm({ ...courseForm, category: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" required>
                <option value="">Choose subject</option>
                {subjectCategories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
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
              <textarea rows={3} value={courseForm.curriculum} onChange={(event) => setCourseForm({ ...courseForm, curriculum: event.target.value })} className="rounded-xl border border-white/80 bg-white/75 p-3 font-mono text-xs outline-none" />
              <select value={courseForm.status} onChange={(event) => setCourseForm({ ...courseForm, status: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none">
                <option value="published">Published after approval</option>
                <option value="draft">Draft after approval</option>
              </select>
              <Button disabled={!subjectCategories.length}>
                <Plus size={17} /> Request Course
              </Button>
            </form>
          </GlassCard>

          <div className="grid gap-4">
            <GlassCard className="p-5">
              <h2 className="text-xl font-black text-ink">Add assignment</h2>
              <form onSubmit={saveAssignment} className="mt-4 grid gap-3">
                <select value={assignmentForm.course} onChange={(event) => setAssignmentForm({ ...assignmentForm, course: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" required>
                  <option value="">Choose assigned course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
                <input required placeholder="Assignment title" value={assignmentForm.title} onChange={(event) => setAssignmentForm({ ...assignmentForm, title: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                <textarea required rows={3} placeholder="Instructions" value={assignmentForm.instructions} onChange={(event) => setAssignmentForm({ ...assignmentForm, instructions: event.target.value })} className="rounded-xl border border-white/80 bg-white/75 p-3 outline-none" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="date" value={assignmentForm.dueDate} onChange={(event) => setAssignmentForm({ ...assignmentForm, dueDate: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                  <input type="number" min="1" placeholder="Max marks" value={assignmentForm.maxMarks} onChange={(event) => setAssignmentForm({ ...assignmentForm, maxMarks: event.target.value })} className="h-11 rounded-xl border border-white/80 bg-white/75 px-3 outline-none" />
                </div>
                <Button disabled={!courses.length}>
                  <Plus size={17} /> Add Assignment
                </Button>
              </form>
            </GlassCard>

            {requests.map((request) => (
              <GlassCard key={request._id} className="p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Request: {request.status}</p>
                <h3 className="mt-1 text-lg font-black text-ink">{request.payload?.title}</h3>
                {request.adminNote && <p className="mt-2 text-sm font-semibold text-muted">{request.adminNote}</p>}
              </GlassCard>
            ))}

            {courses.map((course) => (
              <GlassCard key={course._id} className="p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">{course.category?.name}</p>
                <h3 className="text-xl font-black text-ink">{course.title}</h3>
                <p className="mt-1 text-sm text-muted">{course.status} | {money(course.discountPrice || course.price)}</p>
              </GlassCard>
            ))}

            {assignments.map((assignment) => (
              <GlassCard key={assignment._id} className="p-4">
                <h3 className="text-xl font-black text-ink">{assignment.title}</h3>
                <p className="mt-1 text-sm font-semibold text-muted">{assignment.course?.title} | Max marks: {assignment.maxMarks}</p>
                <div className="mt-4 overflow-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.16em] text-muted">
                      <tr>
                        <th className="p-2">Student</th>
                        <th className="p-2">Response</th>
                        <th className="p-2">Marks</th>
                        <th className="p-2">Feedback</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(assignment.roster || []).map((student) => {
                        const submission = assignment.submissions?.find((item) => item.student?._id === student._id);
                        const key = `${assignment._id}:${student._id}`;
                        return (
                          <tr key={student._id} className="border-t border-white/70">
                            <td className="p-2 font-bold text-ink">{student.name}<span className="block text-xs text-muted">{student.email}</span></td>
                            <td className="max-w-xs p-2 text-muted">{submission?.answer || 'Not submitted'}</td>
                            <td className="p-2">
                              <input type="number" min="0" max={assignment.maxMarks} defaultValue={submission?.marks ?? ''} onChange={(event) => setMarks({ ...marks, [key]: { ...marks[key], marks: event.target.value } })} className="h-10 w-24 rounded-xl bg-white/70 px-3 font-bold outline-none" />
                            </td>
                            <td className="p-2">
                              <input defaultValue={submission?.feedback || ''} onChange={(event) => setMarks({ ...marks, [key]: { ...marks[key], feedback: event.target.value } })} className="h-10 w-40 rounded-xl bg-white/70 px-3 font-bold outline-none" />
                            </td>
                            <td className="p-2">
                              <Button type="button" variant="secondary" onClick={() => grade(assignment._id, student._id, assignment.maxMarks)} disabled={!submission}>Save</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            ))}

            <GlassCard className="p-4">
              <h2 className="text-xl font-black text-ink">AI quiz reports</h2>
              <div className="mt-4 grid gap-3">
                {quizReports.length ? (
                  quizReports.map((report) => (
                    <div key={report._id} className="rounded-2xl bg-white/60 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">{report.course?.title}</p>
                          <h3 className="text-lg font-black text-ink">{report.user?.name} | {report.moduleTitle}</h3>
                          <p className="mt-1 text-sm font-semibold text-muted">{report.report?.summary || 'Quiz started, report pending.'}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${report.score >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {report.score ?? 0}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-muted">No module quiz reports yet.</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    </>
  );
}
