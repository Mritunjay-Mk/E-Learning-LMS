import { useState } from 'react';
import { Bot, FileText, MessageCircle, Sparkles, WandSparkles } from 'lucide-react';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import { api } from '../../api/client';

const actions = [
  { key: 'chat', label: 'Ask Tutor', icon: MessageCircle },
  { key: 'summary', label: 'Summary', icon: Sparkles },
  { key: 'notes', label: 'Notes', icon: FileText },
  { key: 'quiz', label: 'Quiz', icon: WandSparkles }
];

export default function AITutor({ courseId, lessonTitle = 'Current lesson', lessonContext = '' }) {
  const [mode, setMode] = useState('chat');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const run = async () => {
    setLoading(true);
    setResponse('');
    try {
      const payload = { courseId, lessonContext, title: lessonTitle, lessonTitle, topic: input || lessonTitle, message: input || `Help me understand ${lessonTitle}` };
      const path = mode === 'chat' ? '/ai/chat' : mode === 'summary' ? '/ai/summary' : mode === 'notes' ? '/ai/notes' : '/ai/quiz';
      const data = await api.post(path, payload);
      setResponse(data.response || data.summary || data.notes || JSON.stringify(data.quiz, null, 2));
    } catch (error) {
      setResponse(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3">
        <span className="brand-gradient grid h-11 w-11 place-items-center rounded-xl text-white">
          <Bot size={22} />
        </span>
        <div>
          <h3 className="font-black text-ink">AI Tutor Assistant</h3>
          <p className="text-sm text-muted">{lessonTitle}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => setMode(action.key)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                mode === action.key ? 'brand-gradient text-white shadow-glow' : 'bg-white/60 text-ink hover:bg-white'
              }`}
            >
              <Icon size={16} />
              {action.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={4}
        placeholder={mode === 'chat' ? 'Ask a doubt from this lesson...' : 'Topic, transcript, or concept to work with...'}
        className="mt-4 w-full resize-none rounded-xl border border-white/80 bg-white/70 p-4 text-sm outline-none ring-brand-500 transition placeholder:text-slate-400 focus:ring-2"
      />

      <Button onClick={run} disabled={loading} className="mt-3 w-full">
        {loading ? 'Thinking...' : 'Generate'}
      </Button>

      {response && (
        <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-ink p-4 text-sm leading-6 text-white">
          {response}
        </pre>
      )}
    </GlassCard>
  );
}
