import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Mail } from 'lucide-react';
import logo from '../../../images/logo.png';

const columns = [
  {
    title: 'Programs',
    links: [
      ['Full Stack MERN', '/courses'],
      ['Generative AI & LLMs', '/courses'],
      ['Cloud & DevOps', '/courses'],
      ['System Design & DSA', '/courses'],
      ['PDF Library', '/library']
    ]
  },
  {
    title: 'Company',
    links: [
      ['About Us', '/about'],
      ['Contact Admissions', '/contact'],
      ['Knowledge Base & FAQ', '/faq'],
      ['Student Dashboard', '/dashboard']
    ]
  },
  {
    title: 'Learning Support',
    links: [
      ['24/7 AI Tutor', '/courses'],
      ['Code Practice & Labs', '/courses'],
      ['Certificate Verification', '/profile'],
      ['Terms of Service', '/faq']
    ]
  }
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200/80 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_2fr] lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="LearnHub Academy" className="h-12 w-auto object-contain" />
            <div>
              <span className="block text-xl font-black text-ink">LearnHub Academy</span>
              <span className="text-xs font-bold text-brand-600">Empowering Modern Software Engineers</span>
            </div>
          </Link>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Project-first masterclasses in Full Stack, Generative AI, and Cloud Architecture. Learn from experienced architects and accelerate your engineering career with continuous AI support.
          </p>

          <div className="mt-6 flex gap-3 text-slate-600">
            {[
              { icon: Linkedin, href: 'https://linkedin.com' },
              { icon: Github, href: 'https://github.com' },
              { icon: Instagram, href: 'https://instagram.com' },
              { icon: Mail, href: 'mailto:support@learnhub.ai' }
            ].map(({ icon: Icon, href }, index) => (
              <a
                key={index}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-brand-50 hover:text-brand-600"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">{column.title}</h3>
              <div className="mt-4 grid gap-2.5">
                {column.links.map(([label, to]) => (
                  <Link
                    key={label}
                    to={to}
                    className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200/80 py-5 text-center text-xs font-semibold text-slate-500">
        &copy; {new Date().getFullYear()} LearnHub Academy. Crafted for serious software engineers. All rights reserved.
      </div>
    </footer>
  );
}
