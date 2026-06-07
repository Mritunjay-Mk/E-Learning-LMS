import { Link } from 'react-router-dom';
import clsx from 'clsx';

const variants = {
  primary: 'brand-gradient text-white shadow-glow hover:scale-[1.02]',
  secondary: 'bg-white/70 text-ink border border-white/80 hover:bg-white',
  ghost: 'text-ink hover:bg-white/60',
  danger: 'bg-rose-500 text-white hover:bg-rose-600'
};

export default function Button({ as: Component = 'button', to, variant = 'primary', className, children, ...props }) {
  const classes = clsx(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
