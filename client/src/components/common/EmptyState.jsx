import { SearchX } from 'lucide-react';
import Button from './Button';
import GlassCard from './GlassCard';

export default function EmptyState({ title = 'Nothing found', message = 'Try changing your filters.', actionLabel, actionTo }) {
  return (
    <GlassCard className="grid place-items-center p-10 text-center">
      <SearchX className="mb-4 text-brand-600" size={42} />
      <h3 className="text-xl font-black text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{message}</p>
      {actionLabel && actionTo && (
        <Button to={actionTo} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </GlassCard>
  );
}
