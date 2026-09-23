import { useEffect, useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import CourseCard from '../../components/common/CourseCard';
import EmptyState from '../../components/common/EmptyState';
import GlassCard from '../../components/common/GlassCard';
import Pagination from '../../components/common/Pagination';
import SectionHeading from '../../components/common/SectionHeading';
import Seo from '../../components/common/Seo';
import { CourseCardSkeleton } from '../../components/common/Skeleton';
import { useCourseStore } from '../../stores/courseStore';
import { debounce } from '../../utils/debounce';

export default function Courses() {
  const { courses, categories, filters, pagination, loading, setFilters, fetchCourses, fetchCategories } =
    useCourseStore();

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

  return (
    <>
      <Seo
        title="Courses & Masterclasses"
        description="Browse industry-leading engineering courses with project-driven curriculum, video previews, and integrated 24/7 AI tutoring."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Academy Catalog"
          title="Master Practical Engineering with Industry Mentors"
        >
          Explore hands-on masterclasses across Full Stack, Generative AI, Cloud DevOps, and System Design.
        </SectionHeading>

        {/* Filter Controls Card */}
        <GlassCard className="mt-8 p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
            {/* Search Input */}
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="search"
                defaultValue={filters.search}
                onChange={(event) => debouncedSearch(event.target.value)}
                placeholder="Search masterclasses, topics, tags..."
                className="h-12 w-full rounded-xl border border-white/80 bg-white/75 pl-11 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(event) => update({ category: event.target.value })}
              className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Difficulty Level */}
            <select
              value={filters.level}
              onChange={(event) => update({ level: event.target.value })}
              className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold outline-none"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* Pricing Filter */}
            <select
              value={filters.price}
              onChange={(event) => update({ price: event.target.value })}
              className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold outline-none"
            >
              <option value="">Any Price</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>

            {/* Sort Filter */}
            <select
              value={filters.sort}
              onChange={(event) => update({ sort: event.target.value })}
              className="h-12 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold outline-none"
            >
              <option value="newest">Newest Releases</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter size={13} className="text-brand-600" />
            <span>Showing filtered results from database</span>
          </div>
        </GlassCard>

        {/* Course Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <CourseCardSkeleton key={index} />)
            : courses.map((course) => <CourseCard key={course._id} course={course} />)}
        </div>

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <EmptyState
            title="No courses found"
            message="Try clearing your search query or selecting a different category filter."
          />
        )}

        {/* Pagination */}
        <Pagination pagination={pagination} onPage={(page) => update({ page })} />
      </section>
    </>
  );
}
