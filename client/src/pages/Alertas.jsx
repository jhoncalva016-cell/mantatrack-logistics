import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import AlertsList from '../components/AlertsList';

export default function Alertas() {
  const [alerts, setAlerts] = useState([]);
  const [tab, setTab] = useState('activas');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await api.get('/alerts');
    setAlerts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function resolve(id) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    await api.patch(`/alerts/${id}/resolve`);
  }

  const activas = alerts.filter((a) => !a.resolved);
  const resueltas = alerts.filter((a) => a.resolved);
  const visible = tab === 'activas' ? activas : resueltas;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">Alertas</h1>
          <p className="text-sm text-ink-900/50 mt-0.5">Desvíos de ruta, detenciones prolongadas y niveles bajos de combustible.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <TabButton active={tab === 'activas'} onClick={() => setTab('activas')} label={`Activas (${activas.length})`} />
        <TabButton active={tab === 'resueltas'} onClick={() => setTab('resueltas')} label={`Resueltas (${resueltas.length})`} />
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-4">
        {loading ? (
          <p className="text-sm text-ink-900/40 py-6 text-center">Cargando alertas…</p>
        ) : (
          <AlertsList alerts={visible} onResolve={tab === 'activas' ? resolve : undefined} />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-ink-900 text-white' : 'bg-white text-ink-900/60 hover:text-ink-900 border border-black/10'
      }`}
    >
      {label}
    </button>
  );
}
