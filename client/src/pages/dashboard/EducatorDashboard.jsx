import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardList, Edit, Plus, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import Button from '../../components/common/Button';
import CurriculumBuilder from '../../components/common/CurriculumBuilder';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import StatCard from '../../components/common/StatCard';
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
  duration: '8 hours',
  previewVideoUrl: '',
  status: 'published',
  tags: [],
  outcomes: [],
  requirements: [],
  curriculum: [
    {
      title: 'Module 1: Getting Started',
      lessons: [
        {
          title: 'Welcome & Architecture Overview',
          videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
          duration: '15 min',
          isPreview: true
        }
      ]
    }
  ]
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
    return categories.filter((category) =>
      [category.name, category.slug].some((value) => value?.toLowerCase() === normalized)
    );
  }, [categories, subject]);

  const loadAll = async () => {
    const [courseData, categoryData, requestData, assignmentData, reportData] = await Promise.all([
      api.get('/courses?includeDrafts=true&limit=50').catch(() => ({ courses: [] })),
      api.get('/categories').catch(() => ({ categories: [] })),
      api.get('/course-requests/mine').catch(() => ({ requests: [] })),
      api.get('/assignments').catch(() => ({ assignments: [] })),
      api.get('/module-quizzes/reports').catch(() => ({ reports: [] }))
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

  const requestCourse = async (event) => {
    event.preventDefault();
    setMessage('');
    const payload = {
      ...courseForm,
      price: Number(courseForm.price),
      discountPrice: courseForm.discountPrice === '' ? undefined : Number(courseForm.discountPrice),
      curriculum: courseForm.curriculum
    };

    try {
      await api.post('/course-requests', payload);
      setMessage('Course proposal submitted to Admin for approval.');
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
      setMessage('Assignment created successfully.');
      setAssignmentForm({ ...initialAssignment, course: courses[0]?._id || '' });
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const grade = async (assignmentId, studentId, maxMarks) => {
    const key = `${assignmentId}:${studentId}`;
    const value = marks[key] || {};
    try {
      await api.patch(`/assignments/${assignmentId}/submissions/${studentId}`, {
        marks: Number(value.marks || 0),
        feedback: value.feedback || ''
      });
      setMessage(`Marks saved (${value.marks || 0} / ${maxMarks}).`);
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const publishedCount = courses.filter((course) => course.status === 'published').length;
  const pendingRequests = requests.filter((request) => request.status === 'pending').length;

  return (
    <>
      <Seo title="Educator Studio" description="Educator course proposals, curriculum design, and assignment grading." />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Educator Studio</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Course Studio & Grading</h1>
            <p className="mt-1 text-xs font-bold text-muted">Subject Domain: {subject || 'Software Engineering'}</p>
          </div>
          <Button onClick={loadAll} variant="secondary" size="sm">
            <RefreshCw size={15} /> Refresh
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="Assigned Courses" value={courses.length} tone="brand" />
          <StatCard icon={CheckCircle2} label="Published" value={publishedCount} tone="mint" />
          <StatCard icon={Edit} label="Pending Proposals" value={pendingRequests} tone="amber" />
          <StatCard icon={ClipboardList} label="Assignments" value={assignments.length} tone="coral" />
        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs font-bold text-brand-800">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Visual Course Request Form */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-black text-ink">Propose a New Masterclass</h2>
            <p className="mt-1 text-xs text-muted">Submit a curriculum outline to the admin team for review.</p>

            <form onSubmit={requestCourse} className="mt-5 space-y-4">
              <input
                required
                placeholder="Course Title"
                value={courseForm.title}
                onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 text-sm font-semibold outline-none focus:border-brand-500"
              />

              <input
                placeholder="Subtitle / One-line summary"
                value={courseForm.subtitle}
                onChange={(event) => setCourseForm({ ...courseForm, subtitle: event.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 text-sm outline-none focus:border-brand-500"
              />

              <textarea
                required
                rows={4}
                placeholder="Comprehensive description of the syllabus, skills taught, and tools used..."
                value={courseForm.description}
                onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white/80 p-3 text-sm outline-none focus:border-brand-500"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={courseForm.category}
                  onChange={(event) => setCourseForm({ ...courseForm, category: event.target.value })}
                  className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                  required
                >
                  <option value="">Choose Subject</option>
                  {subjectCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={courseForm.level}
                  onChange={(event) => setCourseForm({ ...courseForm, level: event.target.value })}
                  className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="number"
                  placeholder="Price (INR)"
                  value={courseForm.price}
                  onChange={(event) => setCourseForm({ ...courseForm, price: event.target.value })}
                  className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm outline-none"
                />
                <input
                  type="number"
                  placeholder="Discount Price"
                  value={courseForm.discountPrice}
                  onChange={(event) => setCourseForm({ ...courseForm, discountPrice: event.target.value })}
                  className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm outline-none"
                />
                <input
                  placeholder="Duration (e.g. 10 hours)"
                  value={courseForm.duration}
                  onChange={(event) => setCourseForm({ ...courseForm, duration: event.target.value })}
                  className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm outline-none"
                />
              </div>

              <input
                placeholder="Preview YouTube URL"
                value={courseForm.previewVideoUrl}
                onChange={(event) => setCourseForm({ ...courseForm, previewVideoUrl: event.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 text-sm outline-none"
              />

              {/* Visual Curriculum Builder Component */}
              <CurriculumBuilder
                modules={courseForm.curriculum}
                onChange={(updated) => setCourseForm({ ...courseForm, curriculum: updated })}
              />

              <Button disabled={!subjectCategories.length}>
                <Plus size={16} /> Submit Proposal
              </Button>
            </form>
          </GlassCard>

          {/* Right Column: Assignments & Status */}
          <div className="space-y-6">
            {/* Create Assignment Form */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-black text-ink">Create Course Assignment</h2>
              <form onSubmit={saveAssignment} className="mt-4 space-y-3">
                <select
                  value={assignmentForm.course}
                  onChange={(event) => setAssignmentForm({ ...assignmentForm, course: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                  required
                >
                  <option value="">Select Assigned Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>

                <input
                  required
                  placeholder="Assignment Title"
                  value={assignmentForm.title}
                  onChange={(event) => setAssignmentForm({ ...assignmentForm, title: event.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none"
                />

                <textarea
                  required
                  rows={3}
                  placeholder="Detailed assignment instructions and submission requirements..."
                  value={assignmentForm.instructions}
                  onChange={(event) => setAssignmentForm({ ...assignmentForm, instructions: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white/80 p-3 text-sm outline-none"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(event) => setAssignmentForm({ ...assignmentForm, dueDate: event.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm outline-none"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Max Marks (e.g. 100)"
                    value={assignmentForm.maxMarks}
                    onChange={(event) => setAssignmentForm({ ...assignmentForm, maxMarks: event.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm outline-none"
                  />
                </div>

                <Button disabled={!courses.length}>
                  <Plus size={16} /> Publish Assignment
                </Button>
              </form>
            </GlassCard>

            {/* Proposal Statuses */}
            {requests.map((request) => (
              <GlassCard key={request._id} className="p-4">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                    request.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : request.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {request.status}
                </span>
                <h3 className="mt-2 text-base font-black text-ink">{request.payload?.title}</h3>
                {request.adminNote && <p className="mt-1 text-xs text-muted">{request.adminNote}</p>}
              </GlassCard>
            ))}

            {/* Student Assignment Submissions Grading */}
            {assignments.map((assignment) => (
              <GlassCard key={assignment._id} className="p-5 space-y-3">
                <h3 className="text-base font-black text-ink">{assignment.title}</h3>
                <p className="text-xs text-muted">
                  Course: {assignment.course?.title} &bull; Max marks: {assignment.maxMarks}
                </p>

                <div className="overflow-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className="border-b border-slate-200 text-muted">
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
                          <tr key={student._id} className="border-b border-slate-100">
                            <td className="p-2 font-bold text-ink">{student.name}</td>
                            <td className="p-2 max-w-xs truncate text-muted">
                              {submission?.answer || 'Not submitted'}
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                max={assignment.maxMarks}
                                defaultValue={submission?.marks ?? ''}
                                onChange={(event) =>
                                  setMarks({ ...marks, [key]: { ...marks[key], marks: event.target.value } })
                                }
                                className="h-8 w-16 rounded border border-slate-200 px-2 font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                defaultValue={submission?.feedback || ''}
                                onChange={(event) =>
                                  setMarks({ ...marks, [key]: { ...marks[key], feedback: event.target.value } })
                                }
                                className="h-8 w-28 rounded border border-slate-200 px-2"
                              />
                            </td>
                            <td className="p-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => grade(assignment._id, student._id, assignment.maxMarks)}
                                disabled={!submission}
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
        </div>
      </section>
    </>
  );
}
