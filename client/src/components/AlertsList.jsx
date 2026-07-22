import { severityMeta, timeAgo } from '../lib/status';

export default function AlertsList({ alerts, onResolve, compact = false }) {
  if (!alerts.length) {
    return (
      <div className="text-sm text-ink-900/40 py-6 text-center">
        No hay alertas activas en este momento.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {alerts.map((a) => {
        const meta = severityMeta(a.severity);
        return (
          <div key={a.id} className={`rounded-xl border ${meta.border} ${meta.bg} px-4 py-3`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${meta.text}`}>
                  {a.truckCode} — {a.type === 'desvio' ? 'Desvío de ruta' : a.type === 'detencion' ? 'Detención prolongada' : 'Combustible bajo'}
                </p>
                <p className="text-sm text-ink-900/70 mt-0.5">{a.message}</p>
                <p className="text-xs text-ink-900/40 mt-1">{timeAgo(a.createdAt)} {a.location ? `· ${a.location}` : ''}</p>
              </div>
              {!compact && onResolve && (
                <button
                  onClick={() => onResolve(a.id)}
                  className="shrink-0 text-xs font-medium text-ink-900/50 hover:text-ink-900 border border-black/10 rounded-lg px-2.5 py-1.5 bg-white/70"
                >
                  Resolver
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
