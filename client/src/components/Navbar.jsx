import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/flota', label: 'Flota' },
  { to: '/rutas', label: 'Rutas' },
  { to: '/alertas', label: 'Alertas' },
  { to: '/historial', label: 'Historial' },
  { to: '/reportes', label: 'Reportes' },
];

export default function Navbar() {
  const { user, company, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-black/5">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-8">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 16V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 9h4l3 3v4h-7V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="font-display font-bold text-[15px] tracking-tight text-ink-900">MANTATRACK</p>
            <p className="text-[10px] tracking-[0.18em] text-ink-900/50 -mt-0.5">LOGISTICS</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 flex-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-ink-900 bg-amber-50' : 'text-ink-900/55 hover:text-ink-900 hover:bg-black/[0.03]'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-sm font-semibold text-ink-900">{company?.name || 'Mi empresa'}</p>
            <p className="text-xs text-ink-900/45">{user?.name || 'Administrador'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-ink-900 text-white flex items-center justify-center text-xs font-semibold">
            {(user?.name || 'A').slice(0, 1).toUpperCase()}
          </div>
          <button
            onClick={logout}
            className="text-xs font-medium text-ink-900/45 hover:text-alertred px-2 py-1"
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
