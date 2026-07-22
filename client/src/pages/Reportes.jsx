import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

const KINDS = [
  { key: 'resumen', label: 'Resumen de flota', desc: 'Estado general, distancia y consumo total del período.' },
  { key: 'rendimiento', label: 'Rendimiento de camiones', desc: 'Kilómetros y tiempo en ruta por unidad.' },
  { key: 'combustible', label: 'Consumo de combustible', desc: 'Consumo total y por camión.' },
  { key: 'entregas', label: 'Entregas realizadas', desc: 'Historial de entregas completadas.' },
];

function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function Reportes() {
  const [kind, setKind] = useState('resumen');
  const [from, setFrom] = useState(todayMinus(7));
  const [to, setTo] = useState(todayMinus(0));
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    const { data } = await api.get('/reports');
    setHistory(data);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  async function generate() {
    setGenerating(true);
    try {
      const res = await api.post('/reports/generate', { kind, rangeStart: from, rangeEnd: to }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `mantatrack-${kind}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      loadHistory();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h1 className="text-xl font-display font-bold text-ink-900 mb-1">Reportes</h1>
      <p className="text-sm text-ink-900/50 mb-5">Genera reportes descargables en PDF para tu operación.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl2 shadow-card p-5">
          <h3 className="font-display font-semibold text-ink-900 text-sm mb-3">Tipo de reporte</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {KINDS.map((k) => (
              <button
                key={k.key}
                onClick={() => setKind(k.key)}
                className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                  kind === k.key ? 'border-amber-500 bg-amber-50' : 'border-black/10 hover:bg-black/[0.02]'
                }`}
              >
                <p className="text-sm font-semibold text-ink-900">{k.label}</p>
                <p className="text-xs text-ink-900/50 mt-1">{k.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Desde</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Hasta</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
            </div>
            <button
              onClick={generate}
              disabled={generating}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 disabled:opacity-60"
            >
              {generating ? 'Generando…' : 'Generar reporte'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl2 shadow-card p-5">
          <h3 className="font-display font-semibold text-ink-900 text-sm mb-3">Reportes generados</h3>
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {history.map((r) => (
              <div key={r.id} className="flex items-center justify-between border border-black/5 rounded-lg px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{r.title}</p>
                  <p className="text-xs text-ink-900/40">{r.rangeStart || 'N/D'} – {r.rangeEnd || 'N/D'}</p>
                </div>
                <span className="text-[10px] font-semibold text-ink-900/40 bg-black/5 rounded px-1.5 py-0.5 shrink-0">PDF</span>
              </div>
            ))}
            {!history.length && <p className="text-sm text-ink-900/40 text-center py-6">Aún no has generado reportes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
