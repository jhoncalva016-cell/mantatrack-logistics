import { statusMeta, timeAgo } from '../lib/status';

export default function FleetTable({ trucks, onSelect, selectedId }) {
  return (
    <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
        <h3 className="font-display font-semibold text-ink-900">Estado de la flota</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-ink-900/40 border-b border-black/5">
              <th className="px-5 py-2.5 font-medium">Camión</th>
              <th className="px-5 py-2.5 font-medium">Conductor</th>
              <th className="px-5 py-2.5 font-medium">Destino</th>
              <th className="px-5 py-2.5 font-medium">ETA</th>
              <th className="px-5 py-2.5 font-medium">Estado</th>
              <th className="px-5 py-2.5 font-medium">Última actualización</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((t) => {
              const meta = statusMeta(t.status);
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelect?.(t)}
                  className={`border-b border-black/5 last:border-0 cursor-pointer transition-colors ${
                    selectedId === t.id ? 'bg-amber-50' : 'hover:bg-black/[0.02]'
                  }`}
                >
                  <td className="px-5 py-3 font-semibold text-ink-900">{t.code}</td>
                  <td className="px-5 py-3 text-ink-900/70">{t.driver}</td>
                  <td className="px-5 py-3 text-ink-900/70">{t.destination || '—'}</td>
                  <td className="px-5 py-3 text-ink-900/70">{t.eta || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.text}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-900/40 text-xs">{timeAgo(t.updatedAt)}</td>
                </tr>
              );
            })}
            {!trucks.length && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-ink-900/40">No hay camiones registrados todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
