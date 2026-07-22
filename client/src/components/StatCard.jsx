export default function StatCard({ icon, label, value, delta, tone = 'default' }) {
  const toneMap = {
    default: 'bg-ink-900 text-white',
    amber: 'bg-amber-500 text-white',
    red: 'bg-alertred text-white',
    green: 'bg-alertgreen text-white',
  };
  return (
    <div className="bg-white rounded-xl2 shadow-card p-4 flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-display font-bold text-ink-900 leading-none">{value}</p>
        <p className="text-xs text-ink-900/50 mt-1.5 truncate">{label}</p>
        {delta && <p className="text-[11px] text-alertgreen mt-0.5">{delta}</p>}
      </div>
    </div>
  );
}
