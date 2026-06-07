import { useState } from 'react';
import clsx from 'clsx';

export default function LazyImage({ src, alt, className, fallback = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80' }) {
  const [loaded, setLoaded] = useState(false);
  const image = src || fallback;

  return (
    <div className={clsx('relative overflow-hidden bg-slate-200', className)}>
      {!loaded && <div className="skeleton absolute inset-0" />}
      <img
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(event) => {
          event.currentTarget.src = fallback;
        }}
        className={clsx('h-full w-full object-cover transition duration-500', loaded ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  );
}
