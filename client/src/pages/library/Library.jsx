import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, LockKeyhole, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import GlassCard from '../../components/common/GlassCard';
import LazyImage from '../../components/common/LazyImage';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';
import { api } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { debounce } from '../../utils/debounce';
import { money } from '../../utils/format';
import { startPayment } from '../../utils/payment';

export default function Library() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [libraryPrice, setLibraryPrice] = useState(499);
  const [search, setSearch] = useState('');
  const [reader, setReader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (query = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      const data = await api.get(`/library/books?${params.toString()}`);
      setBooks(data.books);
      setHasAccess(data.hasAccess);
      setLibraryPrice(data.libraryPrice);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const debounced = useMemo(() => debounce((value) => load(value), 350), []);

  const payForLibrary = async () => {
    if (!token) {
      navigate('/login', { state: { from: '/library' } });
      return;
    }
    try {
      await startPayment({ type: 'library', navigate });
    } catch (err) {
      navigate(`/payment-failed?reason=${encodeURIComponent(err.message)}`);
    }
  };

  const download = async (book) => {
    const data = await api.get(`/library/books/${book._id}/download`);
    window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Seo title="Library" description="Read and download LearnHub AI LMS PDF books with course-based or paid library access." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="PDF Library" title="Books for deeper practice">
            Course students get free library access. Standalone readers can unlock the library with a Razorpay pass.
          </SectionHeading>
          {!hasAccess && (
            <Button onClick={payForLibrary}>
              <LockKeyhole size={18} /> Unlock for {money(libraryPrice)}
            </Button>
          )}
        </div>

        <GlassCard className="mt-8 p-4">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                debounced(event.target.value);
              }}
              placeholder="Search books, authors, categories..."
              className="h-12 w-full rounded-xl border border-white/80 bg-white/75 pl-11 pr-4 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
        </GlassCard>

        {error && <p className="mt-4 rounded-xl bg-rose-100 p-4 text-sm font-bold text-rose-700">{error}</p>}

        <div className="mt-8 grid gap-6 safe-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="skeleton h-80 rounded-2xl" />)
            : books.map((book) => (
                <GlassCard key={book._id} className="overflow-hidden p-3">
                  <LazyImage src={book.coverImage} alt={book.title} className="aspect-[4/3] rounded-xl" fallback="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80" />
                  <div className="p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">{book.category}</p>
                    <h3 className="mt-2 text-xl font-black text-ink">{book.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-muted">{book.author}</p>
                    <p className="line-clamp-3 mt-3 text-sm leading-6 text-muted">{book.description}</p>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Button variant={hasAccess ? 'primary' : 'secondary'} onClick={() => (hasAccess ? setReader(book) : payForLibrary())}>
                        <FileText size={17} /> Read
                      </Button>
                      <Button variant="secondary" onClick={() => (hasAccess ? download(book) : payForLibrary())}>
                        <Download size={17} /> Download
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
        </div>

        {!loading && !books.length && <EmptyState title="No books found" message="Try a different search term." />}
      </section>

      {reader && (
        <div className="fixed inset-0 z-[70] bg-ink/70 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col rounded-2xl bg-white shadow-glow">
            <div className="flex items-center justify-between gap-3 border-b p-4">
              <div>
                <h2 className="font-black text-ink">{reader.title}</h2>
                <p className="text-sm text-muted">{reader.author}</p>
              </div>
              <button type="button" onClick={() => setReader(null)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100">
                <X />
              </button>
            </div>
            <iframe title={reader.title} src={reader.pdfUrl} className="min-h-0 flex-1 rounded-b-2xl" />
          </div>
        </div>
      )}
    </>
  );
}
