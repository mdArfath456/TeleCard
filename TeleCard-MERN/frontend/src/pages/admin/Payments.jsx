import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { money } from '../../components/CardTile';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import AdminTabs from '../../components/AdminTabs';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [remarksMap, setRemarksMap] = useState({});

  const load = (all) =>
    api.get(all ? '/api/payments/admin/all' : '/api/payments/admin/submitted').then(({ data }) => setPayments(data)).finally(() => setLoading(false));

  useEffect(() => { setLoading(true); load(showAll); }, [showAll]);

  const verify = async (id, verified) => {
    try {
      await api.post(`/api/payments/admin/${id}/verify`, { verified, remarks: remarksMap[id] || '' });
      toast.success(verified ? 'Payment verified — order moved to processing' : 'Payment rejected');
      load(showAll);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Loader label="Loading payments" />;

  return (
    <div>
      <AdminTabs />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-white">Payments</h1>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-4 w-4 accent-brand-500" />
          Show all (not just pending)
        </label>
      </div>

      {payments.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center text-slate-400">Nothing to review right now.</div>
      ) : (
        <div className="space-y-4">
          {payments.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-slate-500">{p.orderNumber}</p>
                  <p className="mt-1 font-medium text-white">{p.userName} · {money(p.amount)}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{p.gateway} · {p.paymentMethod} {p.utrNumber && `· UTR ${p.utrNumber}`}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>

              {p.screenshotViewUrl && (
                <a
                  href={p.screenshotViewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300"
                >
                  View screenshot <ExternalLink size={12} />
                </a>
              )}

              {p.status === 'SUBMITTED' && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    placeholder="Remarks (optional)"
                    value={remarksMap[p.id] || ''}
                    onChange={(e) => setRemarksMap({ ...remarksMap, [p.id]: e.target.value })}
                    className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-600"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => verify(p.id, true)} className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/25">
                      <Check size={14} /> Verify
                    </button>
                    <button onClick={() => verify(p.id, false)} className="flex items-center gap-1.5 rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/25">
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
