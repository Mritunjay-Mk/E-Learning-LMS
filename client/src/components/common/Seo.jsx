import { useEffect } from 'react';

export default function Seo({ title, description }) {
  useEffect(() => {
    const pageTitle = title ? `${title} | LearnHub` : 'LearnHub';
    document.title = pageTitle;

    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [title, description]);

  return null;
}
