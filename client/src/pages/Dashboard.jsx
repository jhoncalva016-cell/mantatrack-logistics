import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLiveTrucks } from '../lib/useLiveTrucks';
import MapView from '../components/MapView';
import StatCard from '../components/StatCard';
import FleetTable from '../components/FleetTable';
import AlertsList from '../components/AlertsList';
import TruckDetailPanel from '../components/TruckDetailPanel';

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 16V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 9h4l3 3v4h-7V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9.5 16a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
);
const CoinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M9 15V9l3 2 3-2v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const RouteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="2" /><circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="2" /><path d="M7 17c6 0 4-10 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
);
const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20V10m6 10V4m6 16v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const FuelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 21V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14M5 21h10M5 11h10m4-2 2 2v6a1.5 1.5 0 0 1-3 0v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const REPORT_KINDS = [
  { key: 'resumen', label: 'Resumen de flota', icon: FileIcon },
  { key: 'rendimiento', label: 'Rendimiento de camiones', icon: ChartIcon },
  { key: 'combustible', label: 'Consumo de combustible', icon: FuelIcon },
  { key: 'entregas', label: 'Entregas realizadas', icon: CheckIcon },
];

function todayLabel() {
  return new Date().toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Dashboard() {
  const { user, company } = useAuth();
  const { trucks, loading } = useLiveTrucks();
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [detailTruck, setDetailTruck] = useState(null);
  const [downloadingKind, setDownloadingKind] = useState(null);

  const loadSummary = useCallback(async () => {
    const [{ data: s }, { data: a }] = await Promise.all([
      api.get('/trucks/summary'),
      api.get('/alerts'),
    ]);
    setSummary(s);
    setAlerts(a.filter((x) => !x.resolved).slice(0, 3));
  }, []);

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 5000);
    return () => clearInterval(interval);
  }, [loadSummary]);

  async function downloadReport(kind) {
    setDownloadingKind(kind);
    try {
      const res = await api.post('/reports/generate', { kind }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `mantatrack-${kind}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingKind(null);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">¡Hola, {(user?.name || 'Administrador').split(' ')[0]}!</h1>
          <p className="text-sm text-ink-900/50 mt-0.5">Resumen general de tu flota — {company?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-900/60 bg-white border border-black/10 rounded-lg px-3 py-2">{todayLabel()}</span>
          <button
            onClick={() => downloadReport('resumen')}
            disabled={downloadingKind === 'resumen'}
            className="text-xs font-semibold text-ink-900 bg-white border border-black/10 hover:bg-black/[0.03] rounded-lg px-3 py-2"
          >
            {downloadingKind === 'resumen' ? 'Exportando…' : 'Exportar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-5">
        <StatCard icon={<TruckIcon />} label="Camiones activos" value={summary?.activeTrucks ?? '—'} tone="default" delta="▲ 2 vs ayer" />
        <StatCard icon={<ClockIcon />} label="Entregas a tiempo" value={summary ? `${summary.onTimePct}%` : '—'} tone="green" delta="▲ 12%" />
        <StatCard icon={<BellIcon />} label="Alertas activas" value={summary?.activeAlerts ?? '—'} tone="red" delta="1 desvío de ruta" />
        <StatCard icon={<CoinIcon />} label="Ahorro combustible hoy" value={summary ? `$${summary.fuelSavingsUsd}` : '—'} tone="amber" />
        <StatCard icon={<RouteIcon />} label="Distancia recorrida hoy" value={summary ? `${summary.distanceTodayKm} km` : '—'} tone="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl2 shadow-card p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="font-display font-semibold text-ink-900 text-sm">Mapa en tiempo real</h3>
                <p className="text-xs text-ink-900/40">Quito, Pichincha — actualizado hace unos segundos</p>
              </div>
              <a href="#/mapa" className="text-xs font-semibold text-amber-600 whitespace-nowrap">Ver mapa completo ↗</a>
            </div>
            {!loading && <MapView trucks={trucks} center={summary?.center} height={380} />}
          </div>

          <FleetTable trucks={trucks} onSelect={setDetailTruck} selectedId={detailTruck?.id} />

          <div className="bg-white rounded-xl2 shadow-card p-4">
            <h3 className="font-display font-semibold text-ink-900 text-sm mb-3">Reportes rápidos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {REPORT_KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => downloadReport(k.key)}
                  disabled={downloadingKind === k.key}
                  className="flex flex-col items-center gap-2 text-center border border-black/10 hover:bg-black/[0.02] rounded-xl px-3 py-4 transition-colors disabled:opacity-50"
                >
                  <span className="w-9 h-9 rounded-lg bg-ink-900 text-white flex items-center justify-center">
                    <k.icon />
                  </span>
                  <span className="text-xs font-medium text-ink-900 leading-tight">
                    {downloadingKind === k.key ? 'Generando…' : k.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl2 shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-ink-900 text-sm">Alertas activas</h3>
              <a href="#/alertas" className="text-xs font-medium text-amber-600">Ver todas</a>
            </div>
            <AlertsList alerts={alerts} compact />
          </div>

          <div className="bg-white rounded-xl2 shadow-card p-4">
            <h3 className="font-display font-semibold text-ink-900 text-sm mb-3">Resumen del día</h3>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Distancia recorrida" value={summary ? `${summary.distanceTodayKm} km` : '—'} />
              <MiniStat label="Tiempo en movimiento" value={summary ? `${Math.floor(summary.movingTimeTodayMin / 60)}h ${summary.movingTimeTodayMin % 60}min` : '—'} />
              <MiniStat label="Entregas realizadas" value={summary?.deliveredToday ?? '—'} />
              <MiniStat label="Combustible consumido" value={summary ? `${summary.fuelTodayGal} gal` : '—'} />
            </div>
            <a href="#/historial" className="block text-center text-xs font-semibold text-amber-600 mt-3">Ver más estadísticas →</a>
          </div>

          <div className="bg-white rounded-xl2 shadow-card p-4">
            <h3 className="font-display font-semibold text-ink-900 text-sm mb-3">Acciones rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="#/mapa" className="text-center border border-black/10 hover:bg-black/[0.03] text-ink-900 text-xs font-semibold rounded-lg py-2.5">Ver mapa</a>
              <a href="#/historial" className="text-center border border-black/10 hover:bg-black/[0.03] text-ink-900 text-xs font-semibold rounded-lg py-2.5">Historial</a>
              <a href="#/reportes" className="text-center border border-black/10 hover:bg-black/[0.03] text-ink-900 text-xs font-semibold rounded-lg py-2.5">Reportes</a>
              <a href="#/conductores" className="text-center border border-black/10 hover:bg-black/[0.03] text-ink-900 text-xs font-semibold rounded-lg py-2.5">Conductores</a>
            </div>
          </div>
        </div>
      </div>

      <TruckDetailPanel truck={detailTruck} onClose={() => setDetailTruck(null)} />
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-black/[0.03] rounded-lg p-3">
      <p className="text-base font-display font-bold text-ink-900">{value}</p>
      <p className="text-[11px] text-ink-900/50 mt-0.5">{label}</p>
    </div>
  );
}
