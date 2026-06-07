import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube';
import { Award, BookOpen, CheckCircle2, Clock, Lock, PlayCircle, ShieldCheck, Users, X } from 'lucide-react';
import AITutor from '../../components/ai/AITutor';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import LazyImage from '../../components/common/LazyImage';
import RatingStars from '../../components/common/RatingStars';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';
import { api } from '../../api/client';
import { sampleCourses } from '../../data/catalog';
import { useAuthStore } from '../../stores/authStore';
import { compactNumber, money } from '../../utils/format';
import { startPayment } from '../../utils/payment';

const defaultCurriculum = [
  {
    title: 'Start here',
    lessons: [
      { _id: 'preview-1', title: 'Course overview and roadmap', videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M', duration: '12 min', isPreview: true },
      { _id: 'preview-2', title: 'Project setup and workflow', videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4', duration: '18 min' }
    ]
  },
  {
    title: 'Build and deploy',
    lessons: [
      { _id: 'preview-3', title: 'Payments, progress, and dashboards', videoUrl: 'https://www.youtube.com/watch?v=2HBIzEx6IZA', duration: '20 min' },
      { _id: 'preview-4', title: 'AI tutor and library systems', videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk', duration: '16 min' }
    ]
  }
];

const normalizeLookup = (value = '') =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\bor\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const slugifyTitle = (value = '') =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const findMatchingCourse = (courses, identifier) => {
  const requested = normalizeLookup(identifier);
  return courses.find((item) =>
    [item._id, item.slug, item.title, slugifyTitle(item.title)].some((value) => normalizeLookup(value || '') === requested)
  );
};

const buildGeneratedCourseDetails = (course) => {
  const title = course.title || 'Course';
  const category = course.category?.name || course.category || 'Course';
  const description = course.description || course.subtitle || `A practical ${category} course designed around ${title}.`;
  const previewVideoUrl = course.previewVideoUrl || course.curriculum?.[0]?.lessons?.[0]?.videoUrl || '';

  return {
    ...course,
    subtitle: course.subtitle || `Learn ${title} with a clear, project-first path.`,
    description,
    level: course.level || 'Beginner',
    duration: course.duration || '6 hours',
    outcomes: course.outcomes?.length
      ? course.outcomes
      : [`Understand the core ideas in ${title}`, 'Practice with guided lessons', 'Build confidence with real checkpoints', 'Prepare for the next course in your path'],
    requirements: course.requirements?.length ? course.requirements : ['Basic computer skills', 'A willingness to practice lesson by lesson'],
    tags: course.tags?.length ? course.tags : [category, title.split(' ')[0]].filter(Boolean),
    curriculum: course.curriculum?.length
      ? course.curriculum
      : [
          {
            title: `Module 1: ${title} foundations`,
            lessons: [
              { _id: `${course._id || course.slug || title}-intro`, title: `${title} introduction`, videoUrl: previewVideoUrl, duration: course.duration || '10 min', isPreview: true },
              { _id: `${course._id || course.slug || title}-practice`, title: `Practice plan for ${title}`, videoUrl: previewVideoUrl, duration: '12 min' },
              { _id: `${course._id || course.slug || title}-review`, title: `${title} recap and next steps`, videoUrl: previewVideoUrl, duration: '8 min' }
            ]
          }
        ],
    instructor: course.instructor || {
      name: 'LearnHub Faculty',
      title: `${category} mentor`,
      avatar: '',
      bio: `Project-based mentor for ${title}.`
    }
  };
};

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
  const [message, setMessage] = useState('');
  const [enrollPromptOpen, setEnrollPromptOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const applyCourse = async (data) => {
      setCourse(buildGeneratedCourseDetails(data.course));
      setHasAccess(Boolean(data.hasAccess));
      const reviewData = await api.get(`/courses/${data.course._id}/reviews`).catch(() => ({ reviews: [] }));
      setReviews(reviewData.reviews || []);
    };

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await api.get(`/courses/${slug}`);
        await applyCourse(data);
      } catch {
        const courseData = await api.get('/courses?limit=100').catch(() => ({ courses: [] }));
        const catalogMatch = findMatchingCourse(courseData.courses || [], slug);
        if (catalogMatch) {
          try {
            const data = await api.get(`/courses/${catalogMatch._id}`);
            await applyCourse(data);
          } catch {
            setCourse(buildGeneratedCourseDetails(catalogMatch));
            setHasAccess(false);
            setReviews([]);
          }
          setLoading(false);
          return;
        }

        const fallback = findMatchingCourse(sampleCourses, slug);
        if (fallback) {
          setCourse(buildGeneratedCourseDetails({ ...fallback, curriculum: defaultCurriculum }));
          setHasAccess(false);
        } else {
          setCourse(null);
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const lessons = useMemo(() => course?.curriculum?.flatMap((module) => module.lessons || []) || [], [course]);
  const preview = course?.previewVideoUrl || lessons[0]?.videoUrl || 'https://www.youtube.com/watch?v=7CqJlxBYj-M';
  const price = course ? course.discountPrice || course.price : 0;

  const buy = async () => {
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

  const submitReview = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const data = await api.post(`/courses/${course._id}/reviews`, reviewForm);
      setReviews((current) => [data.review, ...current.filter((item) => item._id !== data.review._id)]);
      setReviewForm({ rating: 5, comment: '' });
      setMessage('Review saved.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="skeleton h-[520px] rounded-3xl" />
      </section>
    );
  }

  if (notFound || !course) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <GlassCard className="p-8">
          <h1 className="text-3xl font-black text-ink">Course not found</h1>
          <p className="mt-3 text-muted">This course link is not available. Please choose a course from the catalog.</p>
          <Button to="/courses" className="mt-6">
            Browse Courses
          </Button>
        </GlassCard>
      </section>
    );
  }

  return (
    <>
      <Seo title={course.title} description={course.subtitle || course.description} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{course.category?.name || 'Course'}</Badge>
              <Badge tone="green">{course.level}</Badge>
              {hasAccess && <Badge tone="amber">Enrolled</Badge>}
            </div>
            <h1 className="text-4xl font-black leading-tight text-ink sm:text-6xl">{course.title}</h1>
            <p className="mt-5 text-lg leading-8 text-muted">{course.subtitle || course.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm font-bold text-slate-700">
              <RatingStars rating={course.ratingAverage} count={course.ratingCount} />
              <span className="inline-flex items-center gap-2">
                <Users size={18} /> {compactNumber(course.studentsCount || 0)} learners
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={18} /> {course.duration}
              </span>
            </div>
          </div>

          <GlassCard strong className="overflow-hidden p-4">
            {hasAccess ? (
              <div className="player-frame overflow-hidden rounded-2xl bg-ink">
                <ReactPlayer url={preview} width="100%" height="320px" controls light={course.coverImage || course.thumbnailUrl} playIcon={<PlayCircle className="text-white drop-shadow-lg" size={70} />} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEnrollPromptOpen(true)}
                className="group relative block w-full overflow-hidden rounded-2xl bg-ink text-left focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                aria-label="Play course video"
              >
                <LazyImage src={course.coverImage || course.thumbnailUrl} alt={course.title} className="h-[320px] w-full opacity-70 transition group-hover:scale-[1.02]" />
                <span className="absolute inset-0 grid place-items-center bg-slate-950/35">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-white/95 text-brand-700 shadow-glow transition group-hover:scale-105">
                    <PlayCircle size={42} />
                  </span>
                </span>
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-black text-ink">
                  <Lock size={14} /> Enroll to play
                </span>
              </button>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted">Course price</p>
                <p className="text-3xl font-black text-ink">{price === 0 ? 'Free' : money(price)}</p>
              </div>
              {hasAccess ? (
                <Button to={`/watch/${course._id || course.slug}`}>
                  <PlayCircle size={18} /> Watch Course
                </Button>
              ) : (
                <Button onClick={buy} disabled={paying}>
                  <ShieldCheck size={18} /> {paying ? 'Opening checkout...' : 'Enroll Now'}
                </Button>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <GlassCard className="p-6">
              <SectionHeading eyebrow="Curriculum" title={`${lessons.length} lessons with in-site playback`} />
              <div className="mt-6 space-y-4">
                {(course.curriculum?.length ? course.curriculum : defaultCurriculum).map((module, moduleIndex) => (
                  <div key={module._id || module.title} className="rounded-2xl bg-white/60 p-4">
                    <h3 className="font-black text-ink">
                      {moduleIndex + 1}. {module.title}
                    </h3>
                    <div className="mt-3 grid gap-2">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <div key={lesson._id || lesson.title} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3 text-sm">
                          <span className="flex items-center gap-3 font-bold text-slate-700">
                            <PlayCircle size={17} className="text-brand-600" />
                            {lesson.title}
                          </span>
                          <span className="shrink-0 text-muted">{lesson.duration || `${lessonIndex + 8} min`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <SectionHeading eyebrow="Outcomes" title="What you will be able to do" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(course.outcomes?.length ? course.outcomes : ['Build production LMS features', 'Integrate payments', 'Use AI study workflows']).map((item) => (
                  <div key={item} className="flex gap-3 rounded-xl bg-white/65 p-4 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="shrink-0 text-emerald-600" size={19} />
                    {item}
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <SectionHeading eyebrow="Reviews" title="Student feedback" />
              {token && hasAccess && (
                <form onSubmit={submitReview} className="mt-5 grid gap-3 rounded-2xl bg-white/60 p-4">
                  <select value={reviewForm.rating} onChange={(event) => setReviewForm((value) => ({ ...value, rating: Number(event.target.value) }))} className="h-11 rounded-xl border border-white/80 bg-white/80 px-3 font-semibold">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} stars
                      </option>
                    ))}
                  </select>
                  <textarea value={reviewForm.comment} onChange={(event) => setReviewForm((value) => ({ ...value, comment: event.target.value }))} rows={3} required placeholder="Share your learning experience..." className="rounded-xl border border-white/80 bg-white/80 p-3 outline-none focus:ring-2 focus:ring-brand-500" />
                  <Button>Submit Review</Button>
                  {message && <p className="text-sm font-semibold text-muted">{message}</p>}
                </form>
              )}
              <div className="mt-5 grid gap-3">
                {reviews.length ? (
                  reviews.map((review) => (
                    <div key={review._id} className="rounded-2xl bg-white/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black text-ink">{review.user?.name || 'Student'}</p>
                        <RatingStars rating={review.rating} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-muted">Reviews will appear here once learners complete this course.</p>
                )}
              </div>
            </GlassCard>
          </div>

          <aside className="space-y-6">
            <GlassCard className="p-5">
              <h3 className="text-xl font-black text-ink">Instructor</h3>
              <div className="mt-4 flex items-center gap-3">
                <LazyImage src={course.instructor?.avatar} alt={course.instructor?.name || 'Instructor'} className="h-14 w-14 rounded-xl" />
                <div>
                  <p className="font-black text-ink">{course.instructor?.name || 'LearnHub Faculty'}</p>
                  <p className="text-sm font-semibold text-muted">{course.instructor?.title || 'Senior mentor'}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{course.instructor?.bio || 'Project-based mentor focused on practical outcomes.'}</p>
            </GlassCard>
            <GlassCard className="p-5">
              <h3 className="text-xl font-black text-ink">Includes</h3>
              <div className="mt-4 grid gap-3 text-sm font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <BookOpen size={18} className="text-brand-600" /> Curriculum access
                </span>
                <span className="flex items-center gap-2">
                  <Award size={18} className="text-amber-600" /> Progress tracking
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" /> Free library access
                </span>
              </div>
            </GlassCard>
            <AITutor courseId={course._id} lessonTitle={course.title} lessonContext={course.description} />
          </aside>
        </div>
      </section>

      {enrollPromptOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="enroll-course-title">
          <GlassCard strong className="w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                <Lock size={24} />
              </div>
              <button
                type="button"
                onClick={() => setEnrollPromptOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/70 text-slate-700 transition hover:bg-white"
                aria-label="Close enroll prompt"
              >
                <X size={18} />
              </button>
            </div>
            <h2 id="enroll-course-title" className="mt-5 text-2xl font-black text-ink">Please enroll this course then play</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted">You can view all course details here. Lesson videos unlock only after enrollment.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => {
                setEnrollPromptOpen(false);
                buy();
              }}>
                <ShieldCheck size={18} /> Enroll Now
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEnrollPromptOpen(false)}>
                View Details
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
