import { motion } from 'framer-motion';
import { BookOpen, Clock, PlayCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import Button from './Button';
import GlassCard from './GlassCard';
import LazyImage from './LazyImage';
import RatingStars from './RatingStars';
import { compactNumber, money } from '../../utils/format';

export default function CourseCard({ course }) {
  const price = course.discountPrice || course.price;
  const coursePath = `/courses/${course._id || course.slug}`;

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="w-full max-w-[360px] mx-auto">
      <GlassCard className="group h-full overflow-hidden p-2.5">
        <Link to={coursePath} className="block">
          <div className="relative overflow-hidden rounded-xl">
            <LazyImage src={course.coverImage || course.thumbnailUrl} alt={course.title} className="aspect-video w-full rounded-xl transition duration-300 group-hover:scale-105" />
            <span className="absolute left-2.5 top-2.5">
              <Badge tone="white">{course.category?.name || 'Course'}</Badge>
            </span>
            <span className="absolute bottom-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-600 shadow-md transition group-hover:scale-110">
              <PlayCircle size={20} />
            </span>
          </div>
        </Link>

        <div className="p-2.5 pt-3">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {course.duration}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Users size={13} /> {compactNumber(course.studentsCount || 0)}
            </span>
          </div>

          <Link to={coursePath}>
            <h3 className="line-clamp-2 min-h-[2.6rem] text-[0.98rem] font-bold leading-snug text-ink transition group-hover:text-brand-700">
              {course.title}
            </h3>
          </Link>
          <p className="line-clamp-2 mt-1 min-h-[2.4rem] text-xs leading-5 text-muted">
            {course.subtitle || course.description}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <RatingStars rating={course.ratingAverage} count={course.ratingCount} size={13} />
            <Badge tone={course.level === 'Advanced' ? 'rose' : course.level === 'Intermediate' ? 'amber' : 'green'}>
              {course.level}
            </Badge>
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-white/70 pt-3">
            <div>
              <p className="text-[11px] font-semibold text-muted leading-tight">Enroll from</p>
              <p className="text-lg font-black text-ink">{price === 0 ? 'Free' : money(price)}</p>
            </div>
            <Button to={coursePath} className="h-9 px-3.5 text-xs font-bold gap-1.5">
              <BookOpen size={15} />
              View
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
