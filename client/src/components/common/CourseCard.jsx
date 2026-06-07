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
    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <GlassCard className="group h-full overflow-hidden p-3">
        <Link to={coursePath} className="block">
          <div className="relative">
            <LazyImage src={course.coverImage || course.thumbnailUrl} alt={course.title} className="aspect-video rounded-xl" />
            <span className="absolute left-3 top-3">
              <Badge tone="white">{course.category?.name || 'Course'}</Badge>
            </span>
            <span className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-brand-600 shadow-lg transition group-hover:scale-110">
              <PlayCircle size={24} />
            </span>
          </div>
        </Link>

        <div className="p-3">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock size={14} /> {course.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={14} /> {compactNumber(course.studentsCount || 0)}
            </span>
          </div>

          <Link to={coursePath}>
            <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-black leading-7 text-ink transition group-hover:text-brand-700">{course.title}</h3>
          </Link>
          <p className="line-clamp-2 mt-2 min-h-[3rem] text-sm leading-6 text-muted">{course.subtitle || course.description}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <RatingStars rating={course.ratingAverage} count={course.ratingCount} />
            <Badge tone={course.level === 'Advanced' ? 'rose' : course.level === 'Intermediate' ? 'amber' : 'green'}>{course.level}</Badge>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/70 pt-4">
            <div>
              <p className="text-xs font-semibold text-muted">Enroll from</p>
              <p className="text-xl font-black text-ink">{price === 0 ? 'Free' : money(price)}</p>
            </div>
            <Button to={coursePath} className="px-4">
              <BookOpen size={17} />
              View
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
