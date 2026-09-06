import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UploadCloud, CheckCircle2, Copy, QrCode, ShieldCheck, Wallet, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { money } from '../components/CardTile';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const UPI_ID = '8374760456@axl';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [gateway, setGateway] = useState({ razorpayEnabled: false });
  const [mode, setMode] = useState('choose'); // choose | razorpay | manual
  const [loading, setLoading] = useState(true);
  const [rzpBusy, setRzpBusy] = useState(false);
  const [form, setForm] = useState({ paymentMethod: 'UPI', payerName: '', utrNumber: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: o }, { data: cfg }] = await Promise.all([
        api.get(`/api/orders/my/${orderId}`),
        api.get('/api/payments/config'),
      ]);
      setOrder(o);
      setGateway(cfg);

      if (o.status !== 'CANCELLED') {
        const { data: p } = await api.post(`/api/payments/order/${orderId}`).catch(() => ({ data: null }));
        setPayment(p);
      }
    } catch {
      toast.error('Could not load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied');
  };

  const payWithRazorpay = async () => {
    setRzpBusy(true);
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) throw new Error('script-load-failed');

      const { data: session } = await api.post(`/api/payments/order/${orderId}/razorpay/create`);

      const rzp = new window.Razorpay({
        key: session.keyId,
        amount: session.amount,
        currency: session.currency,
        name: session.name,
        description: session.description,
        order_id: session.razorpayOrderId,
        prefill: session.prefill,
        theme: { color: '#7c5cff' },
        handler: async (response) => {
          try {
            await api.post(`/api/payments/order/${orderId}/razorpay/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment verified — order is now processing!');
            await load();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
            setMode('manual');
          }
        },
        modal: {
          ondismiss: () => toast('Payment cancelled — you can retry or pay manually', { icon: 'ℹ️' }),
        },
      });

      rzp.on('payment.failed', () => {
        toast.error('Razorpay payment failed — switching to manual payment');
        setMode('manual');
      });

      rzp.open();
    } catch (err) {
      toast.error('Razorpay is unavailable right now — use manual payment instead');
      setMode('manual');
    } finally {
      setRzpBusy(false);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please attach a payment screenshot');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('paymentMethod', form.paymentMethod);
      fd.append('payerName', form.payerName);
      fd.append('utrNumber', form.utrNumber);
      fd.append('screenshot', file);
      await api.post(`/api/payments/order/${orderId}/submit`, fd);
      toast.success('Payment submitted — awaiting verification');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading order" />;
  if (!order) return <div className="glass rounded-2xl p-10 text-center text-slate-400">Order not found.</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Back to orders
      </Link>

      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-slate-500">{order.orderNumber}</p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white">{money(order.totalAmount)}</h1>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="my-6 h-px bg-white/10" />

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{item.cardName}</p>
                <p className="text-xs text-slate-500">{item.cardType} · {item.cardNetwork} · Qty {item.quantity}</p>
                {item.cardDetails && (
                  <p className="mt-1.5 whitespace-pre-line rounded-lg bg-emerald-500/10 px-3 py-2 font-mono text-xs text-emerald-300">
                    {item.cardDetails}
                  </p>
                )}
              </div>
              <p className="font-semibold text-white">{money(item.subtotal)}</p>
            </div>
          ))}
        </div>

        {order.adminRemarks && (
          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
            <strong>Admin note:</strong> {order.adminRemarks}
          </div>
        )}

        {order.status === 'PAYMENT_PENDING' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h3 className="font-display mb-4 text-lg font-bold text-white">Complete your payment</h3>

            <AnimatePresence mode="wait">
              {mode === 'choose' && (
                <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    onClick={payWithRazorpay}
                    disabled={!gateway.razorpayEnabled || rzpBusy}
                    className="btn-glow payment-option-glow group relative flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-brand-600/20 to-accent-500/10 p-5 text-left transition-shadow hover:shadow-glow-sm disabled:opacity-40"
                  >
                    <ShieldCheck size={20} className="text-accent-400" />
                    <p className="font-semibold text-white">Pay securely with Razorpay</p>
                    <p className="text-xs text-slate-400">Cards, UPI, netbanking & wallets — instant, auto-verified.</p>
                    {!gateway.razorpayEnabled && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-amber-400">
                        <AlertTriangle size={11} /> Not configured on this server
                      </span>
                    )}
                    {rzpBusy && <span className="text-xs text-slate-400">Opening checkout…</span>}
                  </button>
                  <button
                    onClick={() => setMode('manual')}
                    className="flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition-colors hover:bg-white/5"
                  >
                    <Wallet size={20} className="text-slate-300" />
                    <p className="font-semibold text-white">Pay manually</p>
                    <p className="text-xs text-slate-400">Scan our UPI QR, then submit your UTR + screenshot for review.</p>
                  </button>
                </motion.div>
              )}

              {mode === 'manual' && (
                <motion.div key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {gateway.razorpayEnabled && (
                    <button onClick={() => setMode('choose')} className="mb-4 text-xs font-medium text-brand-400 hover:text-brand-300">
                      ← Back to payment options
                    </button>
                  )}

                  <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 p-6 text-center sm:flex-row sm:text-left">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <QrCode size={48} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Scan the QR in your UPI app, or pay directly to:</p>
                      <button onClick={copyUpi} className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm text-brand-400 hover:text-brand-300">
                        {UPI_ID} <Copy size={12} />
                      </button>
                      <p className="mt-1 text-xs text-slate-500">Amount: {money(order.totalAmount)} — then submit your UTR + screenshot below.</p>
                    </div>
                  </div>

                  <form onSubmit={submitPayment} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-400">Payment method</label>
                      <select
                        value={form.paymentMethod}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                        className="w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white"
                      >
                        <option value="UPI">UPI</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-400">Payer name (optional)</label>
                      <input
                        value={form.payerName}
                        onChange={(e) => setForm({ ...form, payerName: e.target.value })}
                        className="w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-600"
                        placeholder="Name on the payment"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium text-slate-400">UTR / Transaction reference number</label>
                      <input
                        required
                        value={form.utrNumber}
                        onChange={(e) => setForm({ ...form, utrNumber: e.target.value })}
                        className="w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-600"
                        placeholder="e.g. 402812345678"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium text-slate-400">Payment screenshot</label>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-6 text-sm text-slate-400 hover:border-brand-500 hover:text-white">
                        <UploadCloud size={16} />
                        {file ? file.name : 'Click to upload screenshot'}
                        <input type="file" accept="image/*" required className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-glow flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-glow-sm disabled:opacity-60 sm:col-span-2"
                    >
                      {submitting ? 'Submitting…' : 'Submit payment for verification'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {payment && payment.status === 'SUBMITTED' && (
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
            <CheckCircle2 size={16} /> Payment submitted — our team is verifying your UTR ({payment.utrNumber}).
          </div>
        )}

        {order.status === 'PROCESSING' && payment?.gateway === 'RAZORPAY' && (
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <ShieldCheck size={16} /> Paid via Razorpay and auto-verified — your order is being processed.
          </div>
        )}

        {order.status === 'COMPLETED' && (
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 size={16} /> Order fulfilled — your card details are shown above.
          </div>
        )}
      </div>
    </div>
  );
}
