import { useState } from 'react';
import { useLiveTrucks } from '../lib/useLiveTrucks';
import api from '../api/client';
import FleetTable from '../components/FleetTable';
import TruckDetailPanel from '../components/TruckDetailPanel';

const emptyForm = {
  code: '', plate: '', model: '', driverName: '', driverPhone: '', destination: '', trackingMode: 'simulado',
};

export default function Flota() {
  const { trucks, loading, refresh } = useLiveTrucks();
  const [detailTruck, setDetailTruck] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newDriverLink, setNewDriverLink] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.code.trim()) return;
    setSaving(true);
    setError('');
    setNewDriverLink(null);
    try {
      const { data } = await api.post('/trucks', form);
      if (form.trackingMode === 'real') {
        const url = `${window.location.origin}${window.location.pathname}#/conductor/${data.trackingToken}`;
        setNewDriverLink({ code: data.code, url });
      }
      setForm(emptyForm);
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el camión.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">Flota</h1>
          <p className="text-sm text-ink-900/50 mb-5">Listado completo de camiones, conductores y estado actual.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 h-fit"
        >
          {showForm ? 'Cancelar' : '+ Agregar camión'}
        </button>
      </div>

      {newDriverLink && (
        <div className="bg-alertgreen/10 border border-alertgreen/20 rounded-xl2 p-4 mb-5">
          <p className="text-sm font-semibold text-alertgreen mb-1">
            {newDriverLink.code} creado con rastreo GPS real
          </p>
          <p className="text-xs text-ink-900/60 mb-2">
            Envía este enlace al celular del conductor. Debe abrirlo desde su teléfono y presionar
            "Iniciar seguimiento" para que su ubicación aparezca en el mapa.
          </p>
          <div className="flex items-center gap-2">
            <input readOnly value={newDriverLink.url} className="flex-1 text-xs bg-white rounded-lg px-3 py-2 border border-black/10 truncate" />
            <button
              onClick={() => navigator.clipboard.writeText(newDriverLink.url)}
              className="text-xs font-medium bg-ink-900 text-white rounded-lg px-3 py-2 shrink-0"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl2 shadow-card p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Código interno</label>
            <input required value={form.code} onChange={(e) => update('code', e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="CAM-09" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Placa</label>
            <input value={form.plate} onChange={(e) => update('plate', e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="PIF0030" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Marca / Modelo</label>
            <input value={form.model} onChange={(e) => update('model', e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="Mazda BT-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Conductor</label>
            <input value={form.driverName} onChange={(e) => update('driverName', e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="Nombre y apellido" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Teléfono del conductor</label>
            <input value={form.driverPhone} onChange={(e) => update('driverPhone', e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="0998645322" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Destino</label>
            <input value={form.destination} onChange={(e) => update('destination', e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="Quito" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Modo de rastreo</label>
            <select value={form.trackingMode} onChange={(e) => update('trackingMode', e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm bg-white">
              <option value="simulado">Simulado (demostración)</option>
              <option value="real">Real — GPS del celular del conductor</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <button disabled={saving} type="submit" className="w-full bg-ink-900 text-white text-sm font-semibold rounded-lg px-4 py-2.5">
              {saving ? 'Guardando…' : 'Guardar camión'}
            </button>
          </div>
          {error && <p className="sm:col-span-2 lg:col-span-3 text-sm text-alertred bg-alertred/10 rounded-lg px-3 py-2">{error}</p>}
        </form>
      )}

      {!loading && <FleetTable trucks={trucks} onSelect={setDetailTruck} selectedId={detailTruck?.id} />}

      <TruckDetailPanel truck={detailTruck} onClose={() => setDetailTruck(null)} onDeleted={refresh} />
    </div>
  );
}
