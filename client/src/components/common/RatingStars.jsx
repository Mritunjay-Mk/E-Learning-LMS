import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, count, size = 16 }) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={size} className={index < Math.round(rating) ? 'fill-amber-400' : 'fill-transparent text-slate-300'} />
      ))}
      {count !== undefined && <span className="ml-1 text-xs font-semibold text-muted">({count})</span>}
    </div>
  );
}
