import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, ShieldCheck, Gift, Percent, Wallet, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { money } from '../components/CardTile';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NETWORK_GRADIENTS = {
  VISA: 'from-[#3b2fd9] via-[#5a3fef] to-[#1f8fff]',
  MASTERCARD: 'from-[#eb5b28] via-[#d6224a] to-[#f6a509]',
  RUPAY: 'from-[#0f8f5f] via-[#0c6f9c] to-[#123f7a]',
  AMEX: 'from-[#0a5c6e] via-[#0f7d8f] to-[#0a3f5c]',
  DEFAULT: 'from-brand-700 via-brand-500 to-accent-500',
};

function InfoBlock({ icon: Icon, title, text }) {
  if (!text) return null;
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <Icon size={15} className="text-accent-400" /> {title}
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [card, setCard] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/cards/${id}`)
      .then(({ data }) => setCard(data))
      .catch(() => toast.error('Card not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading card" />;
  if (!card) return <div className="glass rounded-2xl p-10 text-center text-slate-400">Card not found.</div>;

  const gradient = NETWORK_GRADIENTS[card.cardNetwork?.toUpperCase()] || NETWORK_GRADIENTS.DEFAULT;
  const outOfStock = card.status !== 'ACTIVE' || card.stock <= 0;

  const handleAdd = async () => {
    if (!user) return navigate('/login');
    setAdding(true);
    try {
      await addToCart(card.id, qty);
      toast.success(`${card.cardName} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <Link to="/cards" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Back to cards
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="sticky top-28">
            <motion.div
              whileHover={{ rotateY: 6, rotateX: -3 }}
              style={{ transformStyle: 'preserve-3d' }}
              className={`relative flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-7 shadow-glow`}
            >
              <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative flex items-start justify-between">
                <span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                  {card.cardType}
                </span>
                <span className="font-display text-lg font-bold uppercase tracking-widest text-white/90">{card.cardNetwork}</span>
              </div>
              <div className="relative">
                <div className="mb-3 h-8 w-11 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 opacity-90" />
                <p className="font-mono text-lg tracking-[0.3em] text-white/90">•••• •••• •••• {String(card.id).slice(-4).padStart(4, '0')}</p>
              </div>
              <div className="relative flex items-end justify-between">
                <p className="text-xl font-semibold text-white">{card.cardName}</p>
                <p className="text-xs text-white/70">Valid: {card.validity || 'Lifetime'}</p>
              </div>
            </motion.div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-slate-500">Annual fee</p>
                <p className="mt-1 text-lg font-semibold text-white">{card.annualFee ? money(card.annualFee) : 'Nil'}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-slate-500">Interest rate</p>
                <p className="mt-1 text-lg font-semibold text-white">{card.interestRate ? `${card.interestRate}%` : '—'}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-slate-500">Credit limit</p>
                <p className="mt-1 text-lg font-semibold text-white">{card.creditLimit ? money(card.creditLimit) : '—'}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-slate-500">Cash withdrawal</p>
                <p className="mt-1 text-lg font-semibold text-white">{card.cashWithdrawalLimit ? money(card.cashWithdrawalLimit) : '—'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-400">{card.categoryName}</p>
          <h1 className="font-display mt-1 text-3xl font-bold text-white">{card.cardName}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.description}</p>

          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl font-bold text-white">{money(card.price)}</p>
            {outOfStock ? (
              <span className="mb-1 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-300">Out of stock</span>
            ) : (
              <span className="mb-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">{card.stock} available</span>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <div className="glass flex items-center gap-4 rounded-xl px-4 py-2.5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-slate-400 hover:text-white">
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-semibold text-white">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(card.stock, q + 1))} className="text-slate-400 hover:text-white">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="btn-glow flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-glow-sm disabled:opacity-60"
              >
                <ShoppingCart size={16} /> {adding ? 'Adding…' : 'Add to cart'}
              </button>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <InfoBlock icon={Gift} title="Rewards" text={card.rewards} />
            <InfoBlock icon={ShieldCheck} title="Benefits" text={card.benefits} />
            <InfoBlock icon={Percent} title="Eligibility" text={card.eligibility} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
