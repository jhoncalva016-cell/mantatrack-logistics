import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

export default function Planes() {
  const [plans, setPlans] = useState([]);
  const [currentKey, setCurrentKey] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: s }] = await Promise.all([
      api.get('/settings/plans'),
      api.get('/settings'),
    ]);
    setPlans(p.plans);
    setCurrentKey(p.currentPlanKey);
    setSettings(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function choosePlan(planKey) {
    setError('');
    setSuccess('');
    setSwitching(planKey);
    try {
      await api.post('/settings/plan', { planKey });
      setSuccess('¡Listo! Tu plan se actualizó correctamente.');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cambiar de plan.');
    } finally {
      setSwitching(null);
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <h1 className="text-xl font-display font-bold text-ink-900 mb-1">Planes de membresía</h1>
      <p className="text-sm text-ink-900/50 mb-2">
        Elige el plan que mejor se ajuste al tamaño de tu flota.
      </p>
      {settings && (
        <p className="text-xs text-ink-900/40 mb-5">
          Actualmente usas <strong>{settings.company.activeVehicles}</strong> de{' '}
          <strong>{settings.company.planMaxVehicles}</strong> camiones incluidos en tu plan.
        </p>
      )}

      {error && (
        <div className="mb-5 text-sm text-alertred bg-alertred/10 rounded-lg px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="mb-5 text-sm text-alertgreen bg-alertgreen/10 rounded-lg px-4 py-3">{success}</div>
      )}

      {loading ? (
        <p className="text-sm text-ink-900/40 py-10 text-center">Cargando planes…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isCurrent = plan.key === currentKey;
            const isPopular = plan.key === 'profesional';
            return (
              <div
                key={plan.key}
                className={`relative bg-white rounded-xl2 shadow-card p-6 flex flex-col border-2 ${
                  isCurrent ? 'border-amber-500' : 'border-transparent'
                }`}
              >
                {isPopular && !isCurrent && (
                  <span className="absolute -top-3 left-6 bg-ink-900 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                    Más elegido
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 left-6 bg-amber-500 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                    Tu plan actual
                  </span>
                )}

                <h3 className="font-display font-bold text-lg text-ink-900 mt-2">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-display font-bold text-ink-900">${plan.priceUsd}</span>
                  <span className="text-sm text-ink-900/40"> /mes</span>
                </div>
                <p className="text-xs text-ink-900/40 mb-5">Hasta {plan.maxVehicles} camiones</p>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-900/70">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 text-alertgreen">
                        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={isCurrent || switching === plan.key}
                  onClick={() => choosePlan(plan.key)}
                  className={`w-full text-sm font-semibold rounded-lg py-2.5 transition-colors ${
                    isCurrent
                      ? 'bg-black/5 text-ink-900/40 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {isCurrent ? 'Plan actual' : switching === plan.key ? 'Cambiando…' : 'Elegir este plan'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-ink-900/35 text-center mt-8">
        Esta es una demostración: el cambio de plan es inmediato y no procesa pagos reales.
      </p>
    </div>
  );
}
