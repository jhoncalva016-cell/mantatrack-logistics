import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { statusMeta } from '../lib/status';

export default function Conductores() {
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: d }, { data: t }] = await Promise.all([
      api.get('/drivers'),
      api.get('/trucks'),
    ]);
    setDrivers(d);
    setTrucks(t);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.post('/drivers', form);
      setForm({ name: '', phone: '' });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    await api.delete(`/drivers/${id}`);
  }

  async function assignTruck(driver, truckId) {
    setAssigning(driver.id);
    try {
      // Si el camión elegido ya tenía otro conductor, lo liberamos primero
      if (truckId) {
        const truck = trucks.find((t) => String(t.id) === String(truckId));
        if (truck && truck.driver !== '—') {
          const prevDriver = drivers.find((d) => d.truckId === truck.id);
          if (prevDriver) await api.patch(`/trucks/${truck.id}`, { driverId: null });
        }
      }
      // Si este conductor ya tenía un camión distinto, lo liberamos
      if (driver.truckId && String(driver.truckId) !== String(truckId)) {
        await api.patch(`/trucks/${driver.truckId}`, { driverId: null });
      }
      if (truckId) {
        await api.patch(`/trucks/${truckId}`, { driverId: driver.id });
      }
      await load();
    } finally {
      setAssigning(null);
    }
  }

  const unassignedTrucks = trucks.filter((t) => t.driver === '—');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">Conductores</h1>
          <p className="text-sm text-ink-900/50 mt-0.5">Responsables del seguimiento diario de cada unidad.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5"
        >
          {showForm ? 'Cancelar' : '+ Agregar conductor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl2 shadow-card p-4 mb-5 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Nombre completo</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="Nombre y apellido" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Teléfono</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="09XXXXXXXX" />
          </div>
          <button disabled={saving} type="submit" className="bg-ink-900 text-white text-sm font-semibold rounded-lg px-4 py-2">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-900/40 border-b border-black/5">
                <th className="px-5 py-2.5 font-medium">Conductor</th>
                <th className="px-5 py-2.5 font-medium">Teléfono</th>
                <th className="px-5 py-2.5 font-medium">Camión asignado</th>
                <th className="px-5 py-2.5 font-medium">Estado</th>
                <th className="px-5 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const options = d.truckId
                  ? [{ id: d.truckId, code: d.truckCode }, ...unassignedTrucks]
                  : unassignedTrucks;
                return (
                  <tr key={d.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                    <td className="px-5 py-3 font-semibold text-ink-900">{d.name}</td>
                    <td className="px-5 py-3 text-ink-900/70">{d.phone || '—'}</td>
                    <td className="px-5 py-3">
                      <select
                        value={d.truckId || ''}
                        disabled={assigning === d.id}
                        onChange={(e) => assignTruck(d, e.target.value || null)}
                        className="rounded-lg border border-black/10 px-2.5 py-1.5 text-sm bg-white disabled:opacity-50"
                      >
                        <option value="">Sin asignar</option>
                        {options.map((t) => (
                          <option key={t.id} value={t.id}>{t.code}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      {d.truckStatus ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusMeta(d.truckStatus).bg} ${statusMeta(d.truckStatus).text}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusMeta(d.truckStatus).dot }} />
                          {statusMeta(d.truckStatus).label}
                        </span>
                      ) : <span className="text-ink-900/30 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(d.id)} className="text-xs text-ink-900/40 hover:text-alertred">Eliminar</button>
                    </td>
                  </tr>
                );
              })}
              {!loading && !drivers.length && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-900/40">Aún no has registrado conductores.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
