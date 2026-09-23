import { Plus, Trash2, Video } from 'lucide-react';
import Button from './Button';

/**
 * Visual Curriculum Builder
 * Replaces raw JSON textareas with an interactive, user-friendly
 * module and lesson builder for Admins and Educators.
 */
export default function CurriculumBuilder({ modules = [], onChange }) {
  // Add a new module
  const addModule = () => {
    const newModule = {
      title: `Module ${modules.length + 1}: Getting Started`,
      lessons: [
        {
          title: 'Introduction & Setup',
          videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
          duration: '15 min',
          isPreview: modules.length === 0
        }
      ]
    };
    onChange([...modules, newModule]);
  };

  // Remove a module
  const removeModule = (modIndex) => {
    const updated = modules.filter((_, idx) => idx !== modIndex);
    onChange(updated);
  };

  // Update a module title
  const updateModuleTitle = (modIndex, title) => {
    const updated = [...modules];
    updated[modIndex] = { ...updated[modIndex], title };
    onChange(updated);
  };

  // Add a lesson to a specific module
  const addLesson = (modIndex) => {
    const updated = [...modules];
    const currentLessons = updated[modIndex].lessons || [];
    updated[modIndex] = {
      ...updated[modIndex],
      lessons: [
        ...currentLessons,
        {
          title: `Lesson ${currentLessons.length + 1}`,
          videoUrl: '',
          duration: '15 min',
          isPreview: false
        }
      ]
    };
    onChange(updated);
  };

  // Update a specific lesson field
  const updateLesson = (modIndex, lessonIndex, field, value) => {
    const updated = [...modules];
    const currentLessons = [...updated[modIndex].lessons];
    currentLessons[lessonIndex] = {
      ...currentLessons[lessonIndex],
      [field]: value
    };
    updated[modIndex] = {
      ...updated[modIndex],
      lessons: currentLessons
    };
    onChange(updated);
  };

  // Remove a lesson
  const removeLesson = (modIndex, lessonIndex) => {
    const updated = [...modules];
    updated[modIndex] = {
      ...updated[modIndex],
      lessons: updated[modIndex].lessons.filter((_, idx) => idx !== lessonIndex)
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-black text-ink text-sm">Course Curriculum Builder</h4>
          <p className="text-xs text-muted">Add modules and lesson videos without typing raw JSON.</p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={addModule}>
          <Plus size={15} /> Add Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <p className="text-xs font-semibold text-muted">No modules yet. Click &quot;Add Module&quot; to begin building your curriculum.</p>
        </div>
      ) : (
        modules.map((mod, modIdx) => (
          <div key={modIdx} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-xs font-black text-brand-700">
                {modIdx + 1}
              </span>
              <input
                type="text"
                placeholder="Module Title (e.g. Architecture & Setup)"
                value={mod.title}
                onChange={(e) => updateModuleTitle(modIdx, e.target.value)}
                className="h-9 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm font-bold text-ink outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => removeModule(modIdx)}
                className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"
                title="Delete Module"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Lessons List inside Module */}
            <div className="pl-4 space-y-2 border-l-2 border-slate-100">
              {(mod.lessons || []).map((lesson, lessonIdx) => (
                <div key={lessonIdx} className="grid gap-2 sm:grid-cols-[1.5fr_2fr_1fr_auto_auto] items-center rounded-lg bg-slate-50 p-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Video size={14} className="text-brand-500 shrink-0" />
                    <input
                      placeholder="Lesson Title"
                      value={lesson.title}
                      onChange={(e) => updateLesson(modIdx, lessonIdx, 'title', e.target.value)}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 font-semibold text-ink outline-none"
                    />
                  </div>

                  <input
                    placeholder="YouTube Video URL"
                    value={lesson.videoUrl}
                    onChange={(e) => updateLesson(modIdx, lessonIdx, 'videoUrl', e.target.value)}
                    className="h-8 rounded border border-slate-200 bg-white px-2 text-slate-700 outline-none"
                  />

                  <input
                    placeholder="Duration (e.g. 15 min)"
                    value={lesson.duration}
                    onChange={(e) => updateLesson(modIdx, lessonIdx, 'duration', e.target.value)}
                    className="h-8 rounded border border-slate-200 bg-white px-2 font-mono text-slate-700 outline-none"
                  />

                  <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-600 px-1">
                    <input
                      type="checkbox"
                      checked={Boolean(lesson.isPreview)}
                      onChange={(e) => updateLesson(modIdx, lessonIdx, 'isPreview', e.target.checked)}
                      className="rounded text-brand-600"
                    />
                    <span>Preview</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeLesson(modIdx, lessonIdx)}
                    className="grid h-7 w-7 place-items-center rounded text-rose-500 hover:bg-rose-100"
                    title="Delete Lesson"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addLesson(modIdx)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                <Plus size={14} /> Add Lesson to Module {modIdx + 1}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

