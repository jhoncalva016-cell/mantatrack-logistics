import { useEffect, useState } from 'react';
import api from '../api/client';
import { statusMeta, timeAgo } from '../lib/status';
import MapView from './MapView';

const TABS = ['Información', 'Recorrido', 'Estadísticas'];

export default function TruckDetailPanel({ truck, onClose, onDeleted }) {
  const [tab, setTab] = useState('Información');
  const [history, setHistory] = useState({ rows: [], stats: null });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copied, setCopied] = useState(false);
  const [driverCopied, setDriverCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!truck) return;
    setTab('Información');
    setLoadingHistory(true);
    api.get('/history', { params: { truckId: truck.id } })
      .then(({ data }) => setHistory(data))
      .finally(() => setLoadingHistory(false));
  }, [truck?.id]);

  if (!truck) return null;
  const meta = statusMeta(truck.status);
  const isMoving = truck.status === 'en_ruta' || truck.status === 'desvio';
  const trackingUrl = `${window.location.origin}${window.location.pathname}#/seguimiento/${truck.trackingToken}`;
  const driverUrl = `${window.location.origin}${window.location.pathname}#/conductor/${truck.trackingToken}`;

  function shareLocation() {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function shareDriverLink() {
    navigator.clipboard.writeText(driverUrl);
    setDriverCopied(true);
    setTimeout(() => setDriverCopied(false), 1500);
  }

  async function deleteTruck() {
    if (!window.confirm(`¿Eliminar el camión ${truck.code} (${truck.plate || 'sin placa'}) de forma permanente? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/trucks/${truck.id}`);
      onDeleted?.();
      onClose?.();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo eliminar el camión.');
    } finally {
      setDeleting(false);
    }
  }

  const avgKmPerGal = history.stats && history.stats.fuel > 0 ? (history.stats.distance / history.stats.fuel).toFixed(1) : '—';

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#F5F6F8] h-full overflow-y-auto shadow-2xl">
        <div className="bg-ink-900 text-white p-5">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-white/60 hover:text-white text-sm">← Cerrar</button>
            <button className="text-white/60 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <h2 className="text-xl font-display font-bold">{truck.code}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>{meta.label}</span>
          </div>
          <p className="text-sm text-white/60 mt-1">Conductor: {truck.driver}</p>
          {truck.plate && <p className="text-sm text-white/60">Placa: {truck.plate}{truck.model ? ` · ${truck.model}` : ''}</p>}
          {truck.trackingMode === 'real' && (
            <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-alertgreen/20 text-alertgreen">
              GPS real
            </span>
          )}
        </div>

        <div className="flex border-b border-black/5 bg-white sticky top-0 z-10">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-sm font-medium py-3 border-b-2 transition-colors ${
                tab === t ? 'border-amber-500 text-ink-900' : 'border-transparent text-ink-900/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-5">
          {tab === 'Información' && (
            <>
              <div className="bg-white rounded-xl2 shadow-card p-4">
                <MapView trucks={[truck]} center={{ lat: truck.lat, lng: truck.lng }} height={200} />
              </div>

              <div className="bg-white rounded-xl2 shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-ink-900">Ubicación actual</h3>
                  <span className="text-xs text-ink-900/40">{timeAgo(truck.updatedAt)}</span>
                </div>
                <p className={`text-sm flex items-center gap-1.5 ${isMoving ? 'text-alertgreen' : 'text-ink-900/60'}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: isMoving ? '#1E9E5A' : '#94A3B8' }} />
                  {isMoving ? 'En movimiento' : meta.label}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-ink-900/40">Destino</p>
                    <p className="text-sm font-medium text-ink-900 mt-0.5">{truck.destination || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-900/40">ETA estimada</p>
                    <p className="text-sm font-medium text-ink-900 mt-0.5">{truck.eta || '—'}</p>
                  </div>
                </div>
                <button
                  onClick={shareLocation}
                  className="w-full mt-4 border border-black/10 hover:bg-black/[0.03] text-ink-900 text-sm font-semibold rounded-lg py-2.5 transition-colors"
                >
                  {copied ? 'Enlace copiado ✓' : 'Compartir ubicación'}
                </button>
              </div>

              <div className="bg-white rounded-xl2 shadow-card p-4">
                <h3 className="text-sm font-semibold text-ink-900 mb-3">Información del viaje</h3>
                <div className="space-y-2.5 text-sm">
                  <Row label="Velocidad actual" value={`${truck.speedKmh} km/h`} />
                  <Row label="Combustible restante" value={`${truck.fuelPct}%`} />
                </div>
              </div>

              {truck.trackingMode === 'real' && (
                <div className="bg-white rounded-xl2 shadow-card p-4">
                  <h3 className="text-sm font-semibold text-ink-900 mb-2">Enlace para el conductor</h3>
                  <p className="text-xs text-ink-900/50 mb-3">
                    Este camión usa GPS real. Envía este enlace al celular del conductor para que active el rastreo.
                  </p>
                  <button
                    onClick={shareDriverLink}
                    className="w-full border border-black/10 hover:bg-black/[0.03] text-ink-900 text-sm font-semibold rounded-lg py-2.5 transition-colors"
                  >
                    {driverCopied ? 'Enlace copiado ✓' : 'Copiar enlace del conductor'}
                  </button>
                </div>
              )}

              {truck.driverPhone && (
                
                  href={'tel:' + truck.driverPhone}
                  className="block text-center w-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-lg py-3 transition-colors"
                >
                  Contactar conductor
                </a>
              )}

              <button
                onClick={deleteTruck}
                disabled={deleting}
                className="block text-center w-full border border-alertred/30 hover:bg-alertred/5 text-alertred text-sm font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando…' : 'Eliminar camión'}
              </button>
            </>
          )}

          {tab === 'Recorrido' && (
            <div className="bg-white rounded-xl2 shadow-card p-4">
              <h3 className="text-sm font-semibold text-ink-900 mb-3">Recorridos recientes</h3>
              {loadingHistory && <p className="text-sm text-ink-900/40">Cargando…</p>}
              {!loadingHistory && !history.rows?.length && (
                <p className="text-sm text-ink-900/40 py-4 text-center">Este camión aún no completa recorridos registrados.</p>
              )}
              <div className="space-y-2">
                {history.rows?.map((r) => (
                  <div key={r.id} className="border border-black/5 rounded-lg px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink-900">{r.origin} → {r.destination}</p>
                      <p className="text-xs text-ink-900/40">{r.date}</p>
                    </div>
                    <p className="text-xs text-ink-900/50 mt-1">{r.distanceKm} km · {r.durationMin} min · {r.fuelGal} gal</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Estadísticas' && (
            <div className="bg-white rounded-xl2 shadow-card p-4">
              <h3 className="text-sm font-semibold text-ink-900 mb-3">Estadísticas del camión {truck.code}</h3>
              {history.stats && (
                <div className="grid grid-cols-2 gap-4">
                  <MiniStat label="Distancia recorrida" value={`${history.stats.distance.toFixed(0)} km`} />
                  <MiniStat label="Tiempo en movimiento" value={`${Math.floor(history.stats.duration / 60)}h ${history.stats.duration % 60}min`} />
                  <MiniStat label="Combustible consumido" value={`${history.stats.fuel.toFixed(1)} gal`} />
                  <MiniStat label="Rendimiento promedio" value={`${avgKmPerGal} km/gal`} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-900/50">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-black/[0.03] rounded-lg p-3">
      <p className="text-base font-display font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-900/50 mt-0.5">{label}</p>
    </div>
  );
}
