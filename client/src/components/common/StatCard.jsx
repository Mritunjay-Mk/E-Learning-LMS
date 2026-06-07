import clsx from 'clsx';
import GlassCard from './GlassCard';

export default function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-100 text-brand-700',
    mint: 'bg-emerald-100 text-emerald-700',
    coral: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700'
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">{label}</p>
          <p className="mt-2 text-3xl font-black text-ink">{value}</p>
          {hint && <p className="mt-2 text-xs font-medium text-muted">{hint}</p>}
        </div>
        {Icon && (
          <span className={clsx('grid h-12 w-12 shrink-0 place-items-center rounded-xl', tones[tone])}>
            <Icon size={22} />
          </span>
        )}
      </div>
    </GlassCard>
  );
}
