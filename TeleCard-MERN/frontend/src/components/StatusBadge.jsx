const STYLES = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  INACTIVE: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  OUT_OF_STOCK: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  PAYMENT_PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PAYMENT_SUBMITTED: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  PAYMENT_VERIFIED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  PAYMENT_REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  PROCESSING: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  CANCELLED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  SUBMITTED: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  VERIFIED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  BLOCKED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  DELETED: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.replaceAll('_', ' ')}
    </span>
  );
}
