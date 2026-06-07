import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock3, GraduationCap, Library, PlayCircle, Trophy } from 'lucide-react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import LazyImage from '../../components/common/LazyImage';
import Seo from '../../components/common/Seo';
import StatCard from '../../components/common/StatCard';
import { api } from '../../api/client';
import { dateShort, money } from '../../utils/format';

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/users/dashboard')
      .then((dashboardData) => {
        if (active) setDashboard(dashboardData.dashboard);
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    api
      .get('/assignments')
      .then((assignmentData) => {
        if (active) setAssignments(assignmentData.assignments || []);
      })
      .finally(() => {
        if (active) setAssignmentsLoading(false);
      });

    api
      .get('/users/recommendations')
      .then((recommendationData) => {
        if (active) setRecommendations(recommendationData.recommendations || []);
      })
      .finally(() => {
        if (active) setRecommendationsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const submitAssignment = async (assignmentId) => {
    setMessage('');
    try {
      await api.patch(`/assignments/${assignmentId}/submit`, { answer: responses[assignmentId] || '' });
      const assignmentData = await api.get('/assignments');
      setAssignments(assignmentData.assignments || []);
      setResponses({ ...responses, [assignmentId]: '' });
      setMessage('Assignment submitted.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="skeleton h-[500px] rounded-3xl" />
      </section>
    );
  }

  const stats = dashboard?.stats || {};

  return (
    <>
      <Seo title="Student Dashboard" description="Track LearnHub AI LMS course progress, watch history, payments, and library access." />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">Student Dashboard</p>
            <h1 className="mt-3 text-4xl font-black text-ink">Learning cockpit</h1>
          </div>
          <Button to="/courses">
            <BookOpen size={18} /> Browse Courses
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={GraduationCap} label="Enrolled" value={stats.enrolled || 0} tone="brand" />
          <StatCard icon={Trophy} label="Completed" value={stats.completed || 0} tone="amber" />
          <StatCard icon={Clock3} label="Avg progress" value={`${stats.avgProgress || 0}%`} tone="mint" />
          <StatCard icon={Library} label="Library" value={stats.libraryAccess ? 'Open' : 'Locked'} tone="coral" />
        </div>

        {message && <p className="mt-4 rounded-xl bg-white/75 p-4 text-sm font-bold text-slate-700">{message}</p>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <GlassCard className="p-5">
            <h2 className="text-2xl font-black text-ink">My courses</h2>
            <div className="mt-5 grid gap-4">
              {dashboard?.enrollments?.length ? (
                dashboard.enrollments.map((enrollment) => (
                  <Link key={enrollment._id} to={`/watch/${enrollment.course._id || enrollment.course.slug}`} className="grid gap-4 rounded-2xl bg-white/60 p-3 transition hover:bg-white md:grid-cols-[180px_1fr_auto] md:items-center">
                    <LazyImage src={enrollment.course.coverImage || enrollment.course.thumbnailUrl} alt={enrollment.course.title} className="aspect-video rounded-xl" />
                    <div>
                      <h3 className="text-lg font-black text-ink">{enrollment.course.title}</h3>
                      <p className="mt-2 text-sm text-muted">{enrollment.course.subtitle}</p>
                      <div className="mt-3 h-2 rounded-full bg-slate-200">
                        <div className="h-full rounded-full brand-gradient" style={{ width: `${enrollment.progressPercent}%` }} />
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-brand-700">
                      <PlayCircle size={18} /> {enrollment.progressPercent}%
                    </span>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl bg-white/60 p-6 text-center">
                  <p className="font-bold text-muted">No enrollments yet.</p>
                  <Button to="/courses" className="mt-4">
                    Find a Course
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-5">
              <h2 className="text-xl font-black text-ink">Assignments</h2>
              <div className="mt-4 grid gap-3">
                {assignmentsLoading ? (
                  <div className="skeleton h-24 rounded-xl" />
                ) : assignments.length ? (
                  assignments.map((assignment) => {
                    const submission = assignment.submissions?.[0];
                    return (
                      <div key={assignment._id} className="rounded-xl bg-white/60 p-3 text-sm">
                        <div className="font-bold text-ink">{assignment.title}</div>
                        <p className="mt-1 text-xs font-semibold text-muted">{assignment.course?.title} | Max marks: {assignment.maxMarks}</p>
                        <p className="mt-2 text-slate-600">{assignment.instructions}</p>
                        {submission ? (
                          <div className="mt-3 rounded-xl bg-white/75 p-3">
                            <p className="font-bold text-slate-700">Your response: {submission.answer}</p>
                            <p className="mt-1 text-sm font-bold text-brand-700">
                              Marks: {submission.marks ?? 'Pending'} / {assignment.maxMarks}
                            </p>
                            {submission.feedback && <p className="mt-1 text-sm text-muted">Feedback: {submission.feedback}</p>}
                          </div>
                        ) : (
                          <div className="mt-3 grid gap-2">
                            <textarea rows={3} placeholder="Write your response" value={responses[assignment._id] || ''} onChange={(event) => setResponses({ ...responses, [assignment._id]: event.target.value })} className="rounded-xl border border-white/80 bg-white/75 p-3 outline-none" />
                            <Button type="button" onClick={() => submitAssignment(assignment._id)}>Submit</Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted">No assignments yet.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h2 className="text-xl font-black text-ink">Recommended for you</h2>
              <div className="mt-4 grid gap-3">
                {recommendationsLoading ? (
                  <div className="skeleton h-28 rounded-xl" />
                ) : recommendations.length ? (
                  recommendations.map((item) => (
                    <Link key={item.course._id} to={`/courses/${item.course._id || item.course.slug}`} className="rounded-xl bg-white/60 p-3 text-sm hover:bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">AI fit: {item.fit}</p>
                          <h3 className="mt-1 font-black text-ink">{item.course.title}</h3>
                          <p className="mt-2 text-sm font-semibold text-muted">{item.reason}</p>
                        </div>
                        <span className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-black text-brand-700">#{item.priority}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted">Recommendations will appear when more courses are available.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h2 className="text-xl font-black text-ink">Watch history</h2>
              <div className="mt-4 grid gap-3">
                {dashboard?.history?.length ? (
                  dashboard.history.map((item) => (
                    <Link key={item._id} to={`/watch/${item.course._id || item.course.slug}`} className="rounded-xl bg-white/60 p-3 text-sm font-bold text-slate-700 hover:bg-white">
                      <span className="block text-ink">{item.course.title}</span>
                      <span className="text-xs text-muted">{dateShort(item.updatedAt)}</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted">Your watched lessons will appear here.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h2 className="text-xl font-black text-ink">Orders</h2>
              <div className="mt-4 grid gap-3">
                {dashboard?.payments?.length ? (
                  dashboard.payments.map((payment) => (
                    <div key={payment._id} className="rounded-xl bg-white/60 p-3 text-sm">
                      <div className="flex justify-between gap-3 font-bold text-slate-700">
                        <span>{payment.type === 'library' ? 'Library pass' : payment.course?.title}</span>
                        <span>{money(payment.amount)}</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold uppercase text-muted">{payment.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">Orders will appear after purchase.</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    </>
  );
}
