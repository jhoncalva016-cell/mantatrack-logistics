import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Logo from './Logo';

const LINKS = [
  { to: '/flota', label: 'Inicio', icon: HomeIcon },
  { to: '/mapa', label: 'Mapa en tiempo real', icon: MapIcon },
  { to: '/lista-flota', label: 'Flota', icon: TruckIcon },
  { to: '/rutas', label: 'Rutas', icon: RouteIcon },
  { to: '/alertas', label: 'Alertas', icon: BellIcon, badgeKey: 'activeAlerts' },
  { to: '/historial', label: 'Historial', icon: ClockIcon },
  { to: '/reportes', label: 'Reportes', icon: FileIcon },
  { to: '/conductores', label: 'Conductores', icon: UserIcon },
  { to: '/mantenimiento', label: 'Mantenimiento', icon: WrenchIcon },
  { to: '/configuracion', label: 'Configuración', icon: GearIcon },
];

export default function Sidebar() {
  const { user, company, logout } = useAuth();
  const [plan, setPlan] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    api.get('/settings').then(({ data }) => setPlan(data.company)).catch(() => {});
    api.get('/trucks/summary').then(({ data }) => setActiveAlerts(data.activeAlerts || 0)).catch(() => {});
  }, []);

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-ink-900 border-r border-white/5 flex flex-col">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10 shrink-0">
        <Logo size={32} />
        <div className="leading-tight">
          <p className="font-display font-bold text-[14px] tracking-tight text-white">CALGUY TRACK</p>
          <p className="text-[9px] tracking-[0.18em] text-amber-500 -mt-0.5">LOGISTICS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/mapa'}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl2 text-sm font-medium transition-colors ${
                isActive ? 'bg-amber-500/20 text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <l.icon />
            <span className="flex-1">{l.label}</span>
            {l.badgeKey === 'activeAlerts' && activeAlerts > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-alertred text-white text-[10px] font-bold flex items-center justify-center">
                {activeAlerts}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-3">
        {plan && (
          <div className="bg-white/5 border border-white/10 rounded-xl2 p-3.5 text-white">
            <div className="flex items-center gap-1.5">
              <CrownIcon />
              <p className="text-xs font-semibold">{plan.planName}</p>
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">Vence el {plan.planRenewsAt}</p>
            <div className="mt-3 flex items-center gap-3">
              <PlanRing pct={plan.planUsagePct} />
              <div>
                <p className="text-[11px] text-white/60">Uso del plan</p>
                <p className="text-sm font-semibold">{plan.activeVehicles} de {plan.planMaxVehicles} vehículos</p>
              </div>
            </div>
            <a href="#/planes" className="mt-3 block text-center w-full text-xs font-semibold bg-amber-500 hover:bg-amber-600 rounded-lg py-1.5 transition-colors">
              Ver plan
            </a>
          </div>
        )}

        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {(user?.name || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{company?.name}</p>
            <p className="text-[11px] text-white/40 truncate">{user?.name}</p>
          </div>
          <button onClick={logout} title="Cerrar sesión" className="text-white/40 hover:text-alertred shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>

        <div className="pt-2 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/30">© 2026 CalGuy Track Logistics</p>
          <p className="text-[10px] text-white/30">Todos los derechos reservados.</p>
        </div>
      </div>
    </aside>
  );
}

function HomeIcon() { return <Svg d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />; }
function MapIcon() { return <Svg d="M9 20 3 17V5l6 3m0 12 6-3m-6 3V8m6 9 6 3V10l-6-3m0 12V5m0 0L9 8" />; }
function TruckIcon() { return <Svg d="M3 16V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v10M3 16h1m9 0h4m-5 0V9h4l3 3v4h-2M6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />; }
function RouteIcon() { return <Svg d="M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm14-14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM7 17c6 0 4-10 10-10" />; }
function BellIcon() { return <Svg d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Zm3.5 8a2.5 2.5 0 0 0 5 0" />; }
function ClockIcon() { return <Svg d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3.5 2" />; }
function FileIcon() { return <Svg d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M9 13h6m-6 4h6" />; }
function UserIcon() { return <Svg d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />; }
function WrenchIcon() { return <Svg d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L21 6l-3-3-3.3 3.3Z" />; }
function GearIcon() { return <Svg d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.2-1.7l2-1.6-2-3.4-2.4 1a8 8 0 0 0-2.9-1.7L14 2h-4l-.5 2.6a8 8 0 0 0-2.9 1.7l-2.4-1-2 3.4 2 1.6A8 8 0 0 0 4 12c0 .6.1 1.2.2 1.7l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 2.9 1.7L10 22h4l.5-2.6a8 8 0 0 0 2.9-1.7l2.4 1 2-3.4-2-1.6c.1-.5.2-1.1.2-1.7Z" />; }
function CrownIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="#0B5FFF"><path d="M5 8 2 6l1.5 8h17L22 6l-3 2-4-5-3 4-3-4-4 5Z" /></svg>; }

function PlanRing({ pct = 0 }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, pct) / 100) * c;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
      <circle
        cx="26" cy="26" r={r} fill="none" stroke="#0B5FFF" strokeWidth="5"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text x="26" y="30" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">{pct}%</text>
    </svg>
  );
}

function Svg({ d }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
