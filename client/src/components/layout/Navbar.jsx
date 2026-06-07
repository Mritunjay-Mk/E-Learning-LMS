import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import Button from '../common/Button';
import { useAuthStore } from '../../stores/authStore';
import logo from '../../../images/logo.png';

const links = [
  ['Home', '/'],
  ['Courses', '/courses'],
  ['Library', '/library'],
  ['About', '/about'],
  ['FAQ', '/faq']
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'educator' ? '/educator' : '/dashboard';

  const signOut = async () => {
    await logout();
    navigate('/');
  };

  const navClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-bold transition ${isActive ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-700 hover:bg-white/70'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/55 backdrop-blur-2xl">
      <nav className="mx-auto flex min-h-[var(--nav-height)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="LearnHub" className="h-12 w-auto object-contain" />
          <span className="sr-only">LearnHub</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-2xl bg-white/45 p-1 md:flex">
          {links.map(([label, to]) => (
            <NavLink key={to} to={to} className={navClass}>
              {label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {token && user ? (
            <>
              <Button variant="secondary" to={dashboardPath} className="px-4">
                <LayoutDashboard size={17} />
                Dashboard
              </Button>
              <Button variant="ghost" to="/profile" className="px-3" title="Profile">
                <User size={18} />
              </Button>
              <button type="button" onClick={signOut} className="grid h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-white/70" title="Logout">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Button variant="ghost" to="/login">
                Login
              </Button>
              <Button to="/register">Start Learning</Button>
            </>
          )}
        </div>

        <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-xl bg-white/70 md:hidden">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="mx-4 mb-4 rounded-2xl bg-white/85 p-3 shadow-glass md:hidden">
          <div className="grid gap-1">
            {links.map(([label, to]) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} className={navClass}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
            {token && user ? (
              <>
                <Button to={dashboardPath} onClick={() => setOpen(false)}>
                  Dashboard
                </Button>
                <Button to="/profile" variant="secondary" onClick={() => setOpen(false)}>
                  Profile
                </Button>
                <Button variant="ghost" onClick={signOut}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="secondary" onClick={() => setOpen(false)}>
                  Login
                </Button>
                <Button to="/register" onClick={() => setOpen(false)}>
                  Start Learning
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
