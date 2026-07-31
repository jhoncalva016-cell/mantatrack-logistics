import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Configuracion() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      setSettings(data);
      setCompanyName(data.company.name);
      setCity(data.company.city);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.patch('/settings/company', { name: companyName, city });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-6">
      <h1 className="text-xl font-display font-bold text-ink-900 mb-1">Configuración</h1>
      <p className="text-sm text-ink-900/50 mb-5">Datos de tu empresa, tu cuenta y tu plan.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <form onSubmit={handleSave} className="bg-white rounded-xl2 shadow-card p-5 space-y-4">
          <h3 className="font-display font-semibold text-ink-900 text-sm">Empresa</h3>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Nombre de la empresa</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-900/50 mb-1.5">Ciudad</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
          <button disabled={saving} type="submit" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5">
            {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar cambios'}
          </button>
        </form>

        <div className="space-y-5">
          <div className="bg-white rounded-xl2 shadow-card p-5">
            <h3 className="font-display font-semibold text-ink-900 text-sm mb-3">Tu cuenta</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-900/50">Nombre</span><span className="font-medium text-ink-900">{user?.name}</span></div>
              <div className="flex justify-between"><span className="text-ink-900/50">Correo</span><span className="font-medium text-ink-900">{user?.email}</span></div>
              <div className="flex justify-between"><span className="text-ink-900/50">Rol</span><span className="font-medium text-ink-900 capitalize">{user?.role}</span></div>
            </div>
          </div>

          {settings && (
            <div className="bg-ink-900 rounded-xl2 p-5 text-white">
              <h3 className="font-display font-semibold text-sm">{settings.company.planName}</h3>
              <p className="text-xs text-white/50 mt-1">Vence el {settings.company.planRenewsAt}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span>Uso del plan</span><span>{settings.company.planUsagePct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${settings.company.planUsagePct}%` }} />
                </div>
              </div>
              <a href="#/planes" className="block text-center mt-4 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg py-1.5 transition-colors">
                Cambiar de plan
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
