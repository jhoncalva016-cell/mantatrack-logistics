import { useMemo, useState } from 'react';
import { useLiveTrucks } from '../lib/useLiveTrucks';
import MapView from '../components/MapView';
import TruckDetailPanel from '../components/TruckDetailPanel';
import { statusMeta } from '../lib/status';

export default function Mapa() {
  const { trucks, loading } = useLiveTrucks();
  const [query, setQuery] = useState('');
  const [detailTruck, setDetailTruck] = useState(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return trucks;
    const q = query.toLowerCase();
    return trucks.filter((t) => t.code.toLowerCase().includes(q) || t.driver.toLowerCase().includes(q));
  }, [trucks, query]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">Mapa en tiempo real</h1>
          <p className="text-sm text-ink-900/50 mt-0.5">Manta, Manabí — ubicación de cada camión, actualizada en vivo.</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar camión o conductor…"
          className="w-72 rounded-lg border border-black/10 px-3.5 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 bg-white rounded-xl2 shadow-card p-3">
          {!loading && <MapView trucks={filtered} height={560} />}
        </div>

        <div className="space-y-2.5">
          {filtered.map((t) => {
            const meta = statusMeta(t.status);
            return (
              <button
                key={t.id}
                onClick={() => setDetailTruck(t)}
                className="w-full text-left bg-white rounded-xl2 shadow-card p-3.5 hover:ring-1 hover:ring-amber-500/40 transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{t.plate || t.code}</p>
                    <p className="text-xs text-ink-900/40">{t.code}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>{meta.label}</span>
                </div>
                <p className="text-xs text-ink-900/50 mt-1">{t.driver}</p>
                <p className="text-xs text-ink-900/40">{t.destination || '—'} {t.eta ? `· ETA ${t.eta}` : ''}</p>
              </button>
            );
          })}
          {!filtered.length && <p className="text-sm text-ink-900/40 text-center py-6">Sin resultados.</p>}
        </div>
      </div>

      <TruckDetailPanel truck={detailTruck} onClose={() => setDetailTruck(null)} />
    </div>
  );
}
