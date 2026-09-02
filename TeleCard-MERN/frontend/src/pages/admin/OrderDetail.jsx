import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { money } from '../../components/CardTile';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/orders/admin/${orderId}`);
      setOrder(data);
      setRemarks(data.adminRemarks || '');
    } catch {
      toast.error('Could not load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const fulfill = async () => {
    const items = order.items.map((i) => ({ orderItemId: i.id, cardDetails: details[i.id] || i.cardDetails || '' }));
    if (items.some((i) => !i.cardDetails.trim())) {
      toast.error('Provide card details for every item before completing');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/api/orders/admin/${orderId}/fulfill`, { items, remarks });
      toast.success('Order fulfilled — customer notified');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Fulfillment failed');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.put(`/api/orders/admin/${orderId}/status`, null, { params: { status, remarks } });
      toast.success('Order updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <Loader label="Loading order" />;
  if (!order) return <div className="glass rounded-2xl p-10 text-center text-slate-400">Order not found.</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Back to orders
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-slate-500">{order.orderNumber}</p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white">{order.userName}</h1>
            <p className="text-sm text-slate-400">{order.userEmail} · {order.userPhone}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="my-6 h-px bg-white/10" />

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="rounded-xl bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.cardName}</p>
                  <p className="text-xs text-slate-500">{item.cardType} · {item.cardNetwork} · Qty {item.quantity}</p>
                </div>
                <p className="font-semibold text-white">{money(item.subtotal)}</p>
              </div>
              {order.status === 'PROCESSING' && (
                <textarea
                  rows={2}
                  placeholder="Card number / activation link / delivery details to send the customer…"
                  value={details[item.id] ?? item.cardDetails ?? ''}
                  onChange={(e) => setDetails({ ...details, [item.id]: e.target.value })}
                  className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-600"
                />
              )}
              {item.cardDetails && order.status !== 'PROCESSING' && (
                <p className="mt-2 whitespace-pre-line rounded-lg bg-emerald-500/10 px-3 py-2 font-mono text-xs text-emerald-300">{item.cardDetails}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Admin remarks</label>
          <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {order.status === 'PROCESSING' && (
            <button onClick={fulfill} disabled={saving} className="btn-glow flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm disabled:opacity-60">
              <PackageCheck size={15} /> {saving ? 'Completing…' : 'Mark as completed & send details'}
            </button>
          )}
          {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
            <button onClick={() => updateStatus('CANCELLED')} className="rounded-xl border border-rose-500/30 px-5 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/10">
              Cancel order
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
