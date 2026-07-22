import { useEffect, useState } from 'react';
import { useLiveTrucks } from '../lib/useLiveTrucks';
import MapView from '../components/MapView';
import { statusMeta } from '../lib/status';

export default function Rutas() {
  const { trucks } = useLiveTrucks();
  const [selectedId, setSelectedId] = useState(null);
  const [trail, setTrail] = useState([]);

  const selected = trucks.find((t) => t.id === selectedId) || trucks[0];

  useEffect(() => {
    if (!selected) return;
    setTrail((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.lat === selected.lat && last.lng === selected.lng) return prev;
      const next = [...prev, { lat: selected.lat, lng: selected.lng }];
      return next.slice(-40);
    });
  }, [selected?.lat, selected?.lng]);

  useEffect(() => { setTrail([]); }, [selectedId]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h1 className="text-xl font-display font-bold text-ink-900 mb-1">Rutas en vivo</h1>
      <p className="text-sm text-ink-900/50 mb-5">Selecciona un camión para seguir su trayectoria en tiempo real.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 bg-white rounded-xl2 shadow-card p-2 h-fit">
          {trucks.map((t) => {
            const meta = statusMeta(t.status);
            const active = selected?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg mb-1 flex items-center justify-between transition-colors ${
                  active ? 'bg-amber-50' : 'hover:bg-black/[0.03]'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-ink-900">{t.code}</p>
                  <p className="text-xs text-ink-900/50">{t.destination || '—'}</p>
                </div>
                <span className="w-2 h-2 rounded-full" style={{ background: meta.dot }} />
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selected && (
            <>
              <div className="bg-white rounded-xl2 shadow-card p-4">
                <MapView trucks={[selected]} center={{ lat: selected.lat, lng: selected.lng }} trail={trail} height={440} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard label="Estado" value={statusMeta(selected.status).label} />
                <InfoCard label="Velocidad" value={`${selected.speedKmh} km/h`} />
                <InfoCard label="Combustible" value={`${selected.fuelPct}%`} />
                <InfoCard label="Conductor" value={selected.driver} />
              </div>
            </>
          )}
          {!selected && <p className="text-sm text-ink-900/40">No hay camiones registrados.</p>}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl2 shadow-card p-4">
      <p className="text-lg font-display font-bold text-ink-900 truncate">{value}</p>
      <p className="text-xs text-ink-900/50 mt-1">{label}</p>
    </div>
  );
}
