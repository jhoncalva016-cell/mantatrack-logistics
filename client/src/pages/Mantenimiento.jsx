import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { useLiveTrucks } from '../lib/useLiveTrucks';

export default function Mantenimiento() {
  const { trucks } = useLiveTrucks();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ truckId: '', type: '', description: '', scheduledDate: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/maintenance');
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.truckId || !form.type.trim()) return;
    setSaving(true);
    try {
      await api.post('/maintenance', form);
      setForm({ truckId: '', type: '', description: '', scheduledDate: '' });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function complete(id) {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'completado' } : m)));
    await api.patch(`/maintenance/${id}/complete`);
  }

  const pendientes = items.filter((m) => m.status === 'pendiente');
  const completados = items.filter((m) => m.status === 'completado');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">Mantenimiento</h1>
          <p className="text-sm text-ink-900/50 mt-0.5">Programa y da seguimiento al mantenimiento de cada unidad.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5">
          {showForm ? 'Cancelar' : '+ Programar mantenimiento'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl2 shadow-card p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Camión</label>
            <select required value={form.truckId} onChange={(e) => setForm((f) => ({ ...f, truckId: e.target.value }))} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm">
              <option value="">Selecciona…</option>
              {trucks.map((t) => <option key={t.id} value={t.id}>{t.code}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Tipo</label>
            <input required value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="Cambio de aceite" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Fecha programada</label>
            <input type="date" value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
          <button disabled={saving} type="submit" className="bg-ink-900 text-white text-sm font-semibold rounded-lg px-4 py-2 h-fit">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Descripción (opcional)</label>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="Detalles del mantenimiento" />
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl2 shadow-card p-4">
          <h3 className="font-display font-semibold text-ink-900 text-sm mb-3">Pendientes ({pendientes.length})</h3>
          <div className="space-y-2.5">
            {pendientes.map((m) => (
              <div key={m.id} className="border border-black/5 rounded-lg px-3.5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">{m.truckCode} — {m.type}</p>
                  <span className="text-xs text-ink-900/40">{m.scheduledDate || 'Sin fecha'}</span>
                </div>
                {m.description && <p className="text-xs text-ink-900/50 mt-1">{m.description}</p>}
                <button onClick={() => complete(m.id)} className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-700">
                  Marcar como completado
                </button>
              </div>
            ))}
            {!loading && !pendientes.length && <p className="text-sm text-ink-900/40 text-center py-6">No hay mantenimientos pendientes.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl2 shadow-card p-4">
          <h3 className="font-display font-semibold text-ink-900 text-sm mb-3">Completados ({completados.length})</h3>
          <div className="space-y-2.5">
            {completados.map((m) => (
              <div key={m.id} className="border border-black/5 rounded-lg px-3.5 py-3 opacity-60">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">{m.truckCode} — {m.type}</p>
                  <span className="text-xs text-ink-900/40">{m.scheduledDate || '—'}</span>
                </div>
                {m.description && <p className="text-xs text-ink-900/50 mt-1">{m.description}</p>}
              </div>
            ))}
            {!loading && !completados.length && <p className="text-sm text-ink-900/40 text-center py-6">Aún no hay mantenimientos completados.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
