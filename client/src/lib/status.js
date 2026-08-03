export const STATUS_META = {
  en_ruta: { label: 'En ruta', text: 'text-alertgreen', bg: 'bg-alertgreen/10', dot: '#1E9E5A' },
  detenido: { label: 'Detenido', text: 'text-alertamber', bg: 'bg-alertamber/10', dot: '#E8A020' },
  entregado: { label: 'Entregado', text: 'text-ocean-500', bg: 'bg-ocean-500/10', dot: '#1D6FA5' },
  desvio: { label: 'Desvío de ruta', text: 'text-alertred', bg: 'bg-alertred/10', dot: '#DC3B33' },
  sin_senal: { label: 'Esperando GPS', text: 'text-ink-900/50', bg: 'bg-ink-900/5', dot: '#94A3B8' },
};

export function statusMeta(status) {
  return STATUS_META[status] || { label: status, text: 'text-ink-900/60', bg: 'bg-ink-900/5', dot: '#94A3B8' };
}

export const SEVERITY_META = {
  high: { text: 'text-alertred', bg: 'bg-alertred/10', border: 'border-alertred/20', icon: '⚠️' },
  medium: { text: 'text-alertamber', bg: 'bg-alertamber/10', border: 'border-alertamber/20', icon: '⏱️' },
  low: { text: 'text-ocean-700', bg: 'bg-ocean-500/10', border: 'border-ocean-500/20', icon: '⛽' },
};

export function severityMeta(sev) {
  return SEVERITY_META[sev] || SEVERITY_META.medium;
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z'));
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return d.toLocaleDateString('es-EC');
}
