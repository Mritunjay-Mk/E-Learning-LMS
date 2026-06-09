import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Mail } from 'lucide-react';
import logo from '../../../images/logo.png';

const columns = [
  { title: 'Platform', links: [['Courses', '/courses'], ['Library', '/library'], ['Student Dashboard', '/dashboard'], ] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['FAQ', '/faq'], ['Profile', '/profile']] },
  { title: 'LearnHub', links: [['AI Tutor', '/courses'], ['PDF Library', '/library'], ['Payments', '/courses'], ['Analytics', '/admin']] }
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/70 bg-white/50 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_2fr] lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="LearnHub" className="h-14 w-auto object-contain" />
            <span>
              <span className="block text-xl font-black text-ink">LearnHub</span>
              <span className="text-sm font-semibold text-muted">Courses, library, AI tutor, analytics.</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            A complete MERN learning platform with role-based access, Razorpay payments, Gemini AI learning support, and admin operations.
          </p>
          <div className="mt-6 flex gap-3 text-slate-600">
            {[Linkedin, Instagram, Github, Mail].map((Icon, index) => (
              <span key={index} className="grid h-10 w-10 place-items-center rounded-xl bg-white/70">
                <Icon size={18} />
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-black text-ink">{column.title}</h3>
              <div className="mt-4 grid gap-3">
                {column.links.map(([label, to]) => (
                  <Link key={label} to={to} className="text-sm font-semibold text-muted transition hover:text-brand-700">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/70 py-5 text-center text-sm font-semibold text-muted">&copy; {new Date().getFullYear()} LearnHub. Built for serious learning.</div>
    </footer>
  );
}
