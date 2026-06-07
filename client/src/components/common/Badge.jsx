import clsx from 'clsx';

const tones = {
  blue: 'bg-brand-100 text-brand-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  white: 'bg-white/70 text-ink'
};

export default function Badge({ children, tone = 'blue', className }) {
  return <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>;
}
