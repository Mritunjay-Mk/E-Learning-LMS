import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  PlayCircle,
  ShieldCheck,
  Star,
  Users,
  X
} from 'lucide-react';
import { api } from '../../api/client';
import AITutor from '../../components/ai/AITutor';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import LazyImage from '../../components/common/LazyImage';
import RatingStars from '../../components/common/RatingStars';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';
import { useAuthStore } from '../../stores/authStore';
import { compactNumber, money } from '../../utils/format';
import { startPayment } from '../../utils/payment';

export default function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [enrollPromptOpen, setEnrollPromptOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Load course details and student reviews directly from MongoDB
  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const data = await api.get(`/courses/${slug}`);
        if (!active) return;

        setCourse(data.course);
        setHasAccess(Boolean(data.hasAccess));

        // Load reviews for this course
        if (data.course?._id) {
          const reviewData = await api.get(`/courses/${data.course._id}/reviews`).catch(() => ({ reviews: [] }));
          if (active) setReviews(reviewData.reviews || []);
        }
      } catch (err) {
        if (active) {
          setCourse(null);
          setNotFound(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCourse();

    return () => {
      active = false;
    };
  }, [slug]);

  // Aggregate all lessons from curriculum modules
  const allLessons = useMemo(() => {
    return course?.curriculum?.flatMap((mod) => mod.lessons || []) || [];
  }, [course]);

  // Fallback video preview
  const previewVideo = course?.previewVideoUrl || allLessons[0]?.videoUrl || '';
  const price = course ? (course.discountPrice !== undefined ? course.discountPrice : course.price) : 0;

  // Initiate Razorpay checkout
  const handleEnroll = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/courses/${slug}` } });
      return;
    }

    setPaying(true);
    try {
      await startPayment({ type: 'course', courseId: course._id, navigate });
    } catch (error) {
      navigate(`/payment-failed?reason=${encodeURIComponent(error.message)}`);
    } finally {
      setPaying(false);
    }
  };

  // Submit student review to MongoDB
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMessage('');

    try {
      const data = await api.post(`/courses/${course._id}/reviews`, reviewForm);
      setReviews((prev) => [data.review, ...prev.filter((r) => r._id !== data.review._id)]);
      setReviewForm({ rating: 5, comment: '' });
      setReviewMessage('Your review has been published. Thank you!');
    } catch (error) {
      setReviewMessage(error.message || 'Failed to submit review.');
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="skeleton h-[480px] rounded-3xl" />
      </section>
    );
  }

  if (notFound || !course) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <GlassCard className="p-10 shadow-glass">
          <h1 className="text-3xl font-black text-ink">Course Not Found</h1>
          <p className="mt-3 text-muted">
            The course you are looking for might have been moved or unpublished.
          </p>
          <div className="mt-6">
            <Button to="/courses">Browse Catalog</Button>
          </div>
        </GlassCard>
      </section>
    );
  }

  return (
    <>
      <Seo title={course.title} description={course.subtitle || course.description} />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top Header Grid */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{course.category?.name || 'Development'}</Badge>
              <Badge tone="mint">{course.level || 'All Levels'}</Badge>
              {hasAccess && <Badge tone="amber">Enrolled & Active</Badge>}
            </div>

            <h1 className="text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {course.subtitle || course.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-700">
              <RatingStars rating={course.ratingAverage || 4.9} count={course.ratingCount || 12} />
              <span className="inline-flex items-center gap-2 text-muted">
                <Users size={17} className="text-slate-500" />
                {compactNumber(course.studentsCount || 0)} enrolled
              </span>
              <span className="inline-flex items-center gap-2 text-muted">
                <Clock size={17} className="text-slate-500" />
                {course.duration || '12 hours'}
              </span>
              <span className="inline-flex items-center gap-2 text-muted">
                <Globe size={17} className="text-slate-500" />
                {course.language || 'English'}
              </span>
            </div>
          </div>

          {/* Video Player / Enrollment Card */}
          <GlassCard strong className="overflow-hidden p-4 shadow-xl">
            {hasAccess ? (
              <div className="aspect-video overflow-hidden rounded-2xl bg-ink">
                <ReactPlayer
                  url={previewVideo}
                  width="100%"
                  height="100%"
                  controls
                  light={course.coverImage || course.thumbnailUrl}
                  playIcon={<PlayCircle className="text-white drop-shadow-xl" size={68} />}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEnrollPromptOpen(true)}
                className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-ink text-left focus:outline-none"
              >
                <LazyImage
                  src={course.coverImage || course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-cover opacity-75 transition duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-black/40">
                  <span className="grid h-18 w-18 place-items-center rounded-full bg-white/95 text-brand-600 shadow-glow transition group-hover:scale-110">
                    <PlayCircle size={38} />
                  </span>
                </span>
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-black text-ink shadow-sm">
                  <Lock size={13} /> Free Preview Available
                </span>
              </button>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Tuition Fee</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-ink">
                    {price === 0 ? 'Free' : money(price)}
                  </p>
                  {course.discountPrice && course.price > course.discountPrice && (
                    <span className="text-sm font-semibold text-muted line-through">
                      {money(course.price)}
                    </span>
                  )}
                </div>
              </div>

              {hasAccess ? (
                <Button to={`/watch/${course._id || course.slug}`} size="lg">
                  <PlayCircle size={18} /> Continue Learning
                </Button>
              ) : (
                <Button onClick={handleEnroll} disabled={paying} size="lg">
                  <ShieldCheck size={18} />
                  {paying ? 'Opening Checkout...' : 'Enroll Now'}
                </Button>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Content Body & Sidebar */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Learning Outcomes */}
            {course.outcomes?.length > 0 && (
              <GlassCard className="p-7">
                <SectionHeading
                  eyebrow="Competencies"
                  title="What You Will Master in This Course"
                />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {course.outcomes.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-2xl bg-white/60 p-4 text-sm font-semibold text-slate-800"
                    >
                      <CheckCircle2 className="shrink-0 text-emerald-600 mt-0.5" size={18} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Curriculum Syllabus */}
            <GlassCard className="p-7">
              <SectionHeading
                eyebrow="Syllabus"
                title={`Curriculum (${allLessons.length} Comprehensive Lessons)`}
              />
              <div className="mt-6 space-y-4">
                {course.curriculum?.map((mod, modIdx) => (
                  <div key={mod._id || modIdx} className="rounded-2xl border border-slate-100 bg-white/70 p-5">
                    <h3 className="font-black text-ink text-base">
                      Module {modIdx + 1}: {mod.title}
                    </h3>
                    <div className="mt-3.5 space-y-2">
                      {mod.lessons?.map((lesson, lessonIdx) => (
                        <div
                          key={lesson._id || lessonIdx}
                          className="flex items-center justify-between gap-4 rounded-xl bg-slate-50/80 px-4 py-3 text-sm transition hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-3 font-semibold text-slate-700">
                            <PlayCircle size={16} className="text-brand-600" />
                            {lesson.title}
                          </span>
                          <span className="shrink-0 font-mono text-xs text-muted">
                            {lesson.duration || '15 min'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Prerequisites & Requirements */}
            {course.requirements?.length > 0 && (
              <GlassCard className="p-7">
                <SectionHeading eyebrow="Prerequisites" title="Requirements Before Enrolling" />
                <div className="mt-4 space-y-2.5">
                  {course.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Student Reviews Section */}
            <GlassCard className="p-7">
              <SectionHeading eyebrow="Community" title="Student Feedback & Reviews" />

              {/* Review Submission Form for Enrolled Students */}
              {token && hasAccess && (
                <form onSubmit={handleReviewSubmit} className="mt-6 rounded-2xl bg-white/70 p-5 shadow-sm space-y-3">
                  <h4 className="font-bold text-ink text-sm">Write a Review</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-muted">Rating:</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-bold"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} Stars
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    required
                    rows={3}
                    placeholder="Share how this course helped your skills and what you enjoyed most..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  />

                  <Button size="sm">Submit Review</Button>
                  {reviewMessage && <p className="text-xs font-semibold text-brand-700">{reviewMessage}</p>}
                </form>
              )}

              {/* Reviews List */}
              <div className="mt-6 space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <div key={r._id} className="rounded-2xl bg-white/60 p-4 border border-slate-100">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-black text-ink text-sm">{r.user?.name || 'Verified Learner'}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No student reviews yet. Be the first to review after enrolling!</p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Sticky Sidebar */}
          <aside className="space-y-6">
            {/* Instructor Profile Card */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-black text-ink">Lead Instructor</h3>
              <div className="mt-4 flex items-center gap-3.5">
                {course.instructor?.avatar ? (
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="h-14 w-14 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="brand-gradient grid h-14 w-14 place-items-center rounded-2xl text-xl font-bold text-white shadow-sm">
                    {(course.instructor?.name || 'L').charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-black text-ink">{course.instructor?.name || 'LearnHub Faculty'}</h4>
                  <p className="text-xs font-bold text-brand-600">{course.instructor?.title || 'Principal Mentor'}</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                {course.instructor?.bio || 'Dedicated to teaching modern engineering and scalable web systems.'}
              </p>
            </GlassCard>

            {/* Course Features Inclusions Card */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-black text-ink">This Program Includes:</h3>
              <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-3">
                  <BookOpen size={17} className="text-brand-600" />
                  <span>Full lifetime curriculum access</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award size={17} className="text-amber-600" />
                  <span>Industry-recognized certificate</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={17} className="text-emerald-600" />
                  <span>Unlimited PDF library access</span>
                </div>
              </div>
            </GlassCard>

            {/* AI Tutor Assistant Widget */}
            <AITutor
              courseId={course._id}
              lessonTitle={course.title}
              lessonContext={course.description}
            />
          </aside>
        </div>
      </section>

      {/* Free Preview / Enrollment Prompt Modal */}
      {enrollPromptOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <GlassCard strong className="w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Lock size={22} />
              </span>
              <button
                type="button"
                onClick={() => setEnrollPromptOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="mt-4 text-xl font-black text-ink">Enroll to Unlock Full Masterclass</h3>
            <p className="mt-2 text-sm text-muted">
              Enroll today to access all video lessons, project repositories, AI study assistant, and certificate of completion.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setEnrollPromptOpen(false);
                  handleEnroll();
                }}
              >
                <ShieldCheck size={17} /> Enroll for {price === 0 ? 'Free' : money(price)}
              </Button>
              <Button variant="secondary" onClick={() => setEnrollPromptOpen(false)}>
                Cancel
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
