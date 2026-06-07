import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Bot, ChevronDown, Paperclip, Smile, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import chatbotLogo from '../../../images/chatbotlogo.png';

const quickEmojis = ['😀', '😊', '👍', '🙏', '🔥', '💡', '📚', '✅'];

const initialMessages = [
  {
    id: 'welcome',
    role: 'bot',
    text: 'Hey there\nHow can I help you today?'
  }
];

const cleanResponse = (value) => String(value || '').replace(/\*\*(.*?)\*\*/g, '$1').trim();

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const token = useAuthStore((state) => state.token);

  const canSend = useMemo(() => message.trim().length > 0 && !loading, [loading, message]);

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = '47px';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
  }, [message]);

  const appendEmoji = (emoji) => {
    setMessage((value) => `${value}${emoji}`);
    setEmojiOpen(false);
    inputRef.current?.focus();
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        preview: reader.result
      });
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      attachment
    };

    setMessages((items) => [...items, userMessage]);
    setMessage('');
    setAttachment(null);
    setEmojiOpen(false);

    if (!token) {
      setMessages((items) => [
        ...items,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: 'Please login first to use LearnHub AI Tutor.'
        }
      ]);
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/ai/chat', {
        message: text,
        lessonContext: 'General LearnHub chatbot support'
      });

      setMessages((items) => [
        ...items,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: cleanResponse(data.response)
        }
      ]);
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          error: true,
          text: error.message || 'Something went wrong. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && window.innerWidth > 768) {
      sendMessage(event);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70] sm:bottom-8 sm:right-9">
      <section
        className={`fixed inset-0 z-[70] flex flex-col overflow-hidden bg-white shadow-[0_0_128px_rgba(15,23,42,0.12),0_32px_64px_-48px_rgba(15,23,42,0.65)] transition duration-150 sm:inset-auto sm:bottom-[92px] sm:right-9 sm:h-[620px] sm:max-h-[calc(100vh-120px)] sm:w-[420px] sm:rounded-2xl ${
          open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0 sm:origin-bottom-right sm:scale-50'
        }`}
        aria-label="LearnHub chatbot"
      >
        <header className="flex shrink-0 items-center justify-between bg-brand-700 px-4 py-3 text-white sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-white">
              <img src={chatbotLogo} alt="" className="h-full w-full object-cover" />
            </span>
            <h2 className="text-xl font-bold tracking-wide">LearnHub</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-brand-800"
            aria-label="Close chatbot"
          >
            <ChevronDown size={28} />
          </button>
        </header>

        <div
          ref={chatBodyRef}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 py-6 sm:px-5"
        >
          {messages.map((item) =>
            item.role === 'user' ? (
              <div key={item.id} className="flex flex-col items-end gap-2">
                <p className="max-w-[75%] whitespace-pre-wrap rounded-[13px] rounded-br-[3px] bg-brand-700 px-4 py-3 text-[0.95rem] leading-6 text-white">
                  {item.text}
                </p>
                {item.attachment?.preview && (
                  <img src={item.attachment.preview} alt={item.attachment.name} className="max-h-40 w-1/2 rounded-[13px] rounded-tr-[3px] object-cover" />
                )}
              </div>
            ) : (
              <div key={item.id} className="flex items-end gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-700">
                  <img src={chatbotLogo} alt="" className="h-full w-full object-cover" />
                </span>
                <p
                  className={`max-w-[75%] whitespace-pre-wrap rounded-[13px] rounded-bl-[3px] px-4 py-3 text-[0.95rem] leading-6 ${
                    item.error ? 'bg-rose-50 text-rose-600' : 'bg-[#f2f2ff] text-ink'
                  }`}
                >
                  {item.text}
                  {!token && item.text.includes('Please login') && (
                    <Link to="/login" onClick={() => setOpen(false)} className="mt-2 block font-black text-brand-700">
                      Go to login
                    </Link>
                  )}
                </p>
              </div>
            )
          )}

          {loading && (
            <div className="flex items-end gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-700 text-white">
                <Bot size={18} />
              </span>
              <div className="rounded-[13px] rounded-bl-[3px] bg-[#f2f2ff] px-4 py-5">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        <footer className="w-full shrink-0 bg-white px-4 pb-5 pt-3 sm:px-5">
          {attachment && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-[#f2f2ff] px-3 py-2 text-sm font-semibold text-slate-600">
              <span className="truncate">{attachment.name}</span>
              <button type="button" onClick={() => setAttachment(null)} className="grid h-7 w-7 place-items-center rounded-full text-rose-600 hover:bg-white" aria-label="Remove attachment">
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="relative flex items-end rounded-[32px] bg-white shadow-[0_0_8px_rgba(15,23,42,0.08)] outline outline-1 outline-[#cccce5] focus-within:outline-2 focus-within:outline-brand-700">
            {emojiOpen && (
              <div className="absolute bottom-14 right-8 grid grid-cols-4 gap-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-glass">
                {quickEmojis.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => appendEmoji(emoji)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[#f2f2ff]">
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={onInputKeyDown}
              required
              rows={1}
              placeholder="Message..."
              className="max-h-[180px] min-h-[47px] flex-1 resize-none rounded-[inherit] border-0 bg-transparent py-3.5 pl-4 text-[0.95rem] outline-none placeholder:text-slate-400"
            />
            <div className="flex h-[47px] items-center gap-1 pr-2">
              <button type="button" onClick={() => setEmojiOpen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-full text-[#706db0] transition hover:bg-[#f1f1ff] hover:text-brand-800" aria-label="Pick emoji">
                <Smile size={19} />
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="grid h-9 w-9 place-items-center rounded-full text-[#706db0] transition hover:bg-[#f1f1ff] hover:text-brand-800" aria-label="Attach image">
                <Paperclip size={19} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} hidden />
              {canSend && (
                <button type="submit" className="grid h-9 w-9 place-items-center rounded-full bg-brand-700 text-white transition hover:bg-brand-800" aria-label="Send message">
                  <ArrowUp size={19} />
                </button>
              )}
            </div>
          </form>
        </footer>
      </section>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`grid h-[50px] w-[50px] place-items-center overflow-hidden rounded-full bg-brand-700 text-white shadow-[0_0_20px_rgba(15,23,42,0.16)] transition hover:bg-brand-800 ${open ? 'rotate-90' : ''}`}
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
      >
        {open ? <X size={24} /> : <img src={chatbotLogo} alt="" className="h-full w-full object-cover" />}
      </button>
    </div>
  );
}
