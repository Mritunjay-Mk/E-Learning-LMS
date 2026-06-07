export default function SectionHeading({ eyebrow, title, children, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>}
      <h2 className="text-3xl font-black leading-tight text-ink sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-base leading-7 text-muted sm:text-lg">{children}</p>}
    </div>
  );
}
