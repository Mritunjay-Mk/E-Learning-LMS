import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube';
import { CheckCircle2, ListVideo, PlayCircle } from 'lucide-react';
import AITutor from '../../components/ai/AITutor';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';
import { api } from '../../api/client';

export default function WatchCourse() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [access, setAccess] = useState(false);
  const [progress, setProgress] = useState(null);
  const [selected, setSelected] = useState({ moduleIndex: 0, lessonIndex: 0 });
  const [playing, setPlaying] = useState(false);
  const [moduleQuiz, setModuleQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastSync = useRef(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.get(`/courses/${slug}`);
      setCourse(data.course);
      setAccess(data.hasAccess);
      if (data.hasAccess) {
        const progressData = await api.get(`/courses/${data.course._id}/progress`);
        setProgress(progressData.enrollment);
        if (progressData.enrollment?.lastWatched) {
          setSelected({
            moduleIndex: progressData.enrollment.lastWatched.moduleIndex || 0,
            lessonIndex: progressData.enrollment.lastWatched.lessonIndex || 0
          });
        }
      }
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [slug]);

  const modules = course?.curriculum || [];
  const lesson = modules[selected.moduleIndex]?.lessons?.[selected.lessonIndex];
  const completed = useMemo(() => new Set(progress?.completedLessons?.map((item) => item.lessonId) || []), [progress]);
  const coursePath = course ? `/courses/${course._id || course.slug}` : '/courses';

  const playLesson = (moduleIndex, lessonIndex) => {
    setSelected({ moduleIndex, lessonIndex });
    setModuleQuiz(null);
    setQuizAnswers([]);
    setPlaying(true);
    lastSync.current = 0;
  };

  const startQuizIfModuleComplete = async (enrollment) => {
    const module = modules[selected.moduleIndex];
    if (!course || !module?.lessons?.length) return;
    const completedSet = new Set(enrollment?.completedLessons?.map((item) => item.lessonId) || []);
    const moduleComplete = module.lessons.every((item) => completedSet.has(item._id));
    if (!moduleComplete) return;
    const data = await api.post(`/module-quizzes/courses/${course._id}/modules/${selected.moduleIndex}/start`, {});
    setModuleQuiz(data.moduleQuiz);
    setQuizAnswers(data.moduleQuiz.answers || []);
  };

  const syncProgress = async ({ currentTime = 0, duration = 0, completed: isComplete = false }) => {
    if (!course || !lesson || !access) return;
    const now = Date.now();
    if (!isComplete && now - lastSync.current < 30000) return;
    lastSync.current = now;
    const data = await api.patch(`/courses/${course._id}/progress`, {
      lessonId: lesson._id,
      moduleIndex: selected.moduleIndex,
      lessonIndex: selected.lessonIndex,
      currentTime,
      duration,
      completed: isComplete
    });
    setProgress(data.enrollment);
    if (isComplete) startQuizIfModuleComplete(data.enrollment).catch(() => {});
  };

  const submitQuiz = async () => {
    if (!moduleQuiz) return;
    const data = await api.patch(`/module-quizzes/${moduleQuiz._id}/submit`, { answers: quizAnswers });
    setModuleQuiz(data.moduleQuiz);
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="skeleton h-[560px] rounded-3xl" />
      </section>
    );
  }

  if (!course || !access) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <GlassCard className="p-8">
          <h1 className="text-3xl font-black text-ink">Course access required</h1>
          <p className="mt-3 text-muted">Enroll in this course to watch lessons, track progress, and use lesson-aware AI support.</p>
          <Button to={`/courses/${slug}`} className="mt-6">
            View Course
          </Button>
        </GlassCard>
      </section>
    );
  }

  return (
    <>
      <Seo title={`Watch ${course.title}`} description={`Watch lessons and track progress for ${course.title}.`} />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge tone="green">{progress?.progressPercent || 0}% complete</Badge>
            <h1 className="mt-3 text-3xl font-black text-ink">{course.title}</h1>
          </div>
          <Button to={coursePath} variant="secondary">
            Course Details
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <GlassCard strong className="overflow-hidden p-4">
              <div className="player-frame overflow-hidden rounded-2xl bg-ink">
                <ReactPlayer
                  url={lesson?.videoUrl}
                  width="100%"
                  height="520px"
                  controls
                  playing={playing}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onProgress={({ playedSeconds, loadedSeconds }) => syncProgress({ currentTime: playedSeconds, duration: loadedSeconds })}
                  onEnded={() => syncProgress({ currentTime: 0, duration: 0, completed: true })}
                />
              </div>
              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">Now watching</p>
                  <h2 className="mt-2 text-2xl font-black text-ink">{lesson?.title}</h2>
                </div>
                <Button onClick={() => syncProgress({ completed: true })}>
                  <CheckCircle2 size={18} /> Mark Complete
                </Button>
              </div>
            </GlassCard>

            <AITutor courseId={course._id} lessonTitle={lesson?.title} lessonContext={`${course.title}: ${lesson?.title}`} />

            {moduleQuiz && (
              <GlassCard className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">AI module quiz</p>
                    <h2 className="mt-2 text-2xl font-black text-ink">{moduleQuiz.quiz?.title || moduleQuiz.moduleTitle}</h2>
                  </div>
                  {moduleQuiz.submittedAt && (
                    <Badge tone={moduleQuiz.score >= 75 ? 'green' : 'rose'}>{moduleQuiz.score}%</Badge>
                  )}
                </div>

                {moduleQuiz.submittedAt ? (
                  <div className="mt-5 rounded-2xl bg-white/65 p-4">
                    <h3 className="text-lg font-black text-ink">{moduleQuiz.score >= 75 ? 'Ready for next module' : 'Rewatch recommended'}</h3>
                    <p className="mt-2 text-sm font-semibold text-muted">{moduleQuiz.report?.summary}</p>
                    {moduleQuiz.score < 75 && (
                      <Button type="button" variant="secondary" className="mt-4" onClick={() => playLesson(selected.moduleIndex, 0)}>
                        Rewatch Module
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4">
                    {(moduleQuiz.quiz?.questions || []).map((question, index) => (
                      <div key={question.question} className="rounded-2xl bg-white/65 p-4">
                        <p className="font-black text-ink">{index + 1}. {question.question}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {question.options?.map((option) => (
                            <label key={option} className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold text-slate-700">
                              <input type="radio" name={`q-${index}`} checked={quizAnswers[index] === option} onChange={() => {
                                const next = [...quizAnswers];
                                next[index] = option;
                                setQuizAnswers(next);
                              }} />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button type="button" onClick={submitQuiz}>Submit AI Quiz</Button>
                  </div>
                )}
              </GlassCard>
            )}
          </div>

          <GlassCard className="h-max p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="brand-gradient grid h-10 w-10 place-items-center rounded-xl text-white">
                <ListVideo size={20} />
              </span>
              <div>
                <h2 className="font-black text-ink">Curriculum</h2>
                <p className="text-sm text-muted">{course.curriculum?.length || 0} modules</p>
              </div>
            </div>

            <div className="max-h-[720px] space-y-4 overflow-auto pr-1">
              {modules.map((module, moduleIndex) => (
                <div key={module._id || module.title} className="rounded-2xl bg-white/55 p-3">
                  <h3 className="px-2 py-2 text-sm font-black text-ink">{module.title}</h3>
                  <div className="grid gap-2">
                    {module.lessons?.map((item, lessonIndex) => {
                      const active = selected.moduleIndex === moduleIndex && selected.lessonIndex === lessonIndex;
                      return (
                        <button
                          key={item._id || item.title}
                          type="button"
                          onClick={() => playLesson(moduleIndex, lessonIndex)}
                          className={`flex items-center gap-3 rounded-xl p-3 text-left text-sm font-bold transition ${
                            active ? 'brand-gradient text-white shadow-glow' : 'bg-white/65 text-slate-700 hover:bg-white'
                          }`}
                        >
                          {completed.has(item._id) ? <CheckCircle2 size={18} /> : <PlayCircle size={18} />}
                          <span className="min-w-0 flex-1">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
