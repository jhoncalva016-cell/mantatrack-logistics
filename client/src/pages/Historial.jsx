import { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/client';
import { useLiveTrucks } from '../lib/useLiveTrucks';

function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function Historial() {
  const { trucks } = useLiveTrucks();
  const [truckId, setTruckId] = useState('');
  const [from, setFrom] = useState(todayMinus(14));
  const [to, setTo] = useState(todayMinus(0));
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params = { from, to };
      if (truckId) params.truckId = truckId;
      const { data } = await api.get('/history', { params });
      setRows(data.rows);
      setStats(data.stats);
    } finally {
      setLoading(false);
    }
  }, [truckId, from, to]);

  useEffect(() => { search(); }, [search]);

  const chartData = [...rows]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ date: r.date?.slice(5), km: r.distanceKm }));

  function exportCsv() {
    const header = 'Fecha,Camión,Origen,Destino,Distancia (km),Tiempo (min),Combustible (gal),Conductor\n';
    const body = rows.map((r) => [r.date, r.truckCode, r.origin, r.destination, r.distanceKm, r.durationMin, r.fuelGal, r.driverName].join(',')).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mantatrack-historial.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h1 className="text-xl font-display font-bold text-ink-900 mb-5">Historial de recorridos</h1>

      <div className="bg-white rounded-xl2 shadow-card p-4 mb-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Camión</label>
          <select value={truckId} onChange={(e) => setTruckId(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm min-w-[140px]">
            <option value="">Todos</option>
            {trucks.map((t) => <option key={t.id} value={t.id}>{t.code}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Fecha inicio</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Fecha fin</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
        </div>
        <button onClick={search} className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-2">
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
        <button onClick={exportCsv} className="border border-black/10 text-sm font-medium rounded-lg px-4 py-2 hover:bg-black/[0.03]">
          Exportar CSV
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <StatPill label="Recorridos" value={stats.trips} />
          <StatPill label="Distancia total" value={`${stats.distance.toFixed(0)} km`} />
          <StatPill label="Tiempo total" value={`${Math.floor(stats.duration / 60)}h ${stats.duration % 60}min`} />
          <StatPill label="Combustible total" value={`${stats.fuel.toFixed(1)} gal`} />
        </div>
      )}

      {chartData.length > 1 && (
        <div className="bg-white rounded-xl2 shadow-card p-4 mb-5">
          <h3 className="font-display font-semibold text-ink-900 text-sm mb-3">Distancia recorrida (km)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#EEF0F3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9199A8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9199A8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="km" stroke="#F5A623" strokeWidth={2.5} dot={{ r: 3, fill: '#F5A623' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <h3 className="font-display font-semibold text-ink-900 text-sm">Lista de recorridos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-900/40 border-b border-black/5">
                <th className="px-5 py-2.5 font-medium">Fecha</th>
                <th className="px-5 py-2.5 font-medium">Camión</th>
                <th className="px-5 py-2.5 font-medium">Ruta</th>
                <th className="px-5 py-2.5 font-medium">Distancia</th>
                <th className="px-5 py-2.5 font-medium">Tiempo</th>
                <th className="px-5 py-2.5 font-medium">Combustible</th>
                <th className="px-5 py-2.5 font-medium">Conductor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="px-5 py-3 text-ink-900/70">{r.date}</td>
                  <td className="px-5 py-3 font-semibold text-ink-900">{r.truckCode}</td>
                  <td className="px-5 py-3 text-ink-900/70">{r.origin} → {r.destination}</td>
                  <td className="px-5 py-3 text-ink-900/70">{r.distanceKm} km</td>
                  <td className="px-5 py-3 text-ink-900/70">{r.durationMin} min</td>
                  <td className="px-5 py-3 text-ink-900/70">{r.fuelGal} gal</td>
                  <td className="px-5 py-3 text-ink-900/70">{r.driverName}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-ink-900/40">
                  No hay recorridos registrados en este rango todavía — la flota está en movimiento, vuelve a intentarlo en unos minutos.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="bg-white rounded-xl2 shadow-card p-4">
      <p className="text-xl font-display font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-900/50 mt-1">{label}</p>
    </div>
  );
}
