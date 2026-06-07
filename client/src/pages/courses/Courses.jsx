import { useEffect, useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import CourseCard from '../../components/common/CourseCard';
import EmptyState from '../../components/common/EmptyState';
import GlassCard from '../../components/common/GlassCard';
import Pagination from '../../components/common/Pagination';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';
import { CourseCardSkeleton } from '../../components/common/Skeleton';
import { sampleCourses } from '../../data/catalog';
import { useCourseStore } from '../../stores/courseStore';
import { debounce } from '../../utils/debounce';

export default function Courses() {
  const { courses, categories, filters, pagination, loading, setFilters, fetchCourses, fetchCategories } = useCourseStore();

  useEffect(() => {
    fetchCategories().catch(() => {});
    fetchCourses().catch(() => {});
  }, [fetchCategories, fetchCourses]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        const next = { ...filters, search: value, page: 1 };
        setFilters(next);
        fetchCourses(next).catch(() => {});
      }, 350),
    [fetchCourses, filters, setFilters]
  );

  const update = (patch) => {
    const next = { ...filters, ...patch, page: patch.page || 1 };
    setFilters(next);
    fetchCourses(next).catch(() => {});
  };

  const visibleCourses = courses.length ? courses : sampleCourses;

  return (
    <>
      <Seo title="Courses" description="Browse LearnHub AI LMS courses with category filters, AI-enabled curriculum, and Razorpay enrollment." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Course Catalog" title="Pick a track and start building">
          Search full-stack, AI, analytics, and career courses with video previews and curriculum access after purchase.
        </SectionHeading>

        <GlassCard className="mt-8 p-4">
          <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="search"
                defaultValue={filters.search}
                onChange={(event) => debouncedSearch(event.target.value)}
                placeholder="Search courses..."
                className="h-12 w-full rounded-xl border border-white/80 bg-white/75 pl-11 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>

            <select value={filters.category} onChange={(event) => update({ category: event.target.value })} className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold outline-none">
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select value={filters.level} onChange={(event) => update({ level: event.target.value })} className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold outline-none">
              <option value="">All levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <select value={filters.price} onChange={(event) => update({ price: event.target.value })} className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold outline-none">
              <option value="">Any price</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>

            <select value={filters.sort} onChange={(event) => update({ sort: event.target.value })} className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold outline-none">
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="rating">Top rated</option>
              <option value="priceLow">Price: low</option>
              <option value="priceHigh">Price: high</option>
            </select>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">
            <Filter size={14} />
            Live filters with pagination and debounced search
          </div>
        </GlassCard>

        <div className="mt-8 grid gap-6 safe-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <CourseCardSkeleton key={index} />)
            : visibleCourses.map((course) => <CourseCard key={course._id} course={course} />)}
        </div>

        {!loading && !visibleCourses.length && <EmptyState title="No courses match your filters" />}
        <Pagination pagination={pagination} onPage={(page) => update({ page })} />
      </section>
    </>
  );
}
