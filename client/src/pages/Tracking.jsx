import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api/client';
import MapView from '../components/MapView';
import { statusMeta } from '../lib/status';

export default function Tracking() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await axios.get(`${API_URL}/api/tracking/${token}`);
        if (active) { setData(res.data); setError(''); }
      } catch (err) {
        if (active) setError('Este enlace de seguimiento no es válido o ya expiró.');
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => { active = false; clearInterval(interval); };
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <header className="bg-white border-b border-black/5">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 16V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 9h4l3 3v4h-7V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <div className="leading-tight">
            <p className="font-display font-bold text-[15px] text-ink-900">MANTATRACK</p>
            <p className="text-[10px] tracking-[0.18em] text-ink-900/50 -mt-0.5">LOGISTICS</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-white rounded-xl2 shadow-card p-8 text-center">
            <p className="text-ink-900/60">{error}</p>
          </div>
        )}

        {data && (
          <>
            <p className="text-xs text-ink-900/40 uppercase tracking-wide mb-1">Seguimiento de envío · {data.companyName}</p>
            <h1 className="text-2xl font-display font-bold text-ink-900 mb-5">Camión {data.code}</h1>

            <div className="bg-white rounded-xl2 shadow-card p-4 mb-5">
              <MapView trucks={[{ id: 1, lat: data.lat, lng: data.lng, status: data.status, code: data.code }]} center={{ lat: data.lat, lng: data.lng }} height={340} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Estado" value={statusMeta(data.status).label} />
              <InfoCard label="Destino" value={data.destination || '—'} />
              <InfoCard label="Hora estimada de llegada" value={data.eta || '—'} />
              <InfoCard label="Conductor" value={data.driver} />
            </div>

            <p className="text-xs text-ink-900/35 text-center mt-6">
              Este enlace se actualiza automáticamente cada pocos segundos. © 2026 MantaTrack Logistics.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl2 shadow-card p-4">
      <p className="text-base font-display font-bold text-ink-900 truncate">{value}</p>
      <p className="text-xs text-ink-900/50 mt-1">{label}</p>
    </div>
  );
}
