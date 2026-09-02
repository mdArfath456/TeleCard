import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { money } from '../components/CardTile';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, increase, decrease, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());
  const [checkingOut, setCheckingOut] = useState(false);

  const toggle = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedItems = cart.items.filter((i) => selected.size === 0 || selected.has(i.cartItemId));
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.subtotal, 0);

  const checkout = async () => {
    setCheckingOut(true);
    try {
      const body =
        selected.size === 0
          ? {}
          : { items: [...selected].map((cartItemId) => ({ cartItemId, quantity: cart.items.find((i) => i.cartItemId === cartItemId).quantity })) };

      const { data } = await api.post('/api/orders', body);
      await refreshCart();
      toast.success('Order created — complete your payment');
      navigate(`/orders/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="glass mx-auto max-w-md rounded-3xl p-12 text-center">
        <ShoppingBag size={36} className="mx-auto mb-4 text-slate-600" />
        <h2 className="font-display text-xl font-bold text-white">Your cart is empty</h2>
        <p className="mt-2 text-sm text-slate-400">Browse the catalog and add a few cards to get started.</p>
        <Link
          to="/cards"
          className="btn-glow mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm"
        >
          Browse cards <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="font-display mb-6 text-3xl font-bold text-white">Your cart</h1>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {cart.items.map((item) => (
              <motion.div
                key={item.cartItemId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass flex items-center gap-4 rounded-2xl p-4"
              >
                <input
                  type="checkbox"
                  checked={selected.size === 0 ? true : selected.has(item.cartItemId)}
                  onChange={() => toggle(item.cartItemId)}
                  className="h-4 w-4 accent-brand-500"
                />
                <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 text-[10px] font-bold text-white">
                  {item.cardNetwork}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{item.cardName}</p>
                  <p className="text-xs text-slate-500">{item.cardType} · {money(item.price)} each</p>
                </div>
                <div className="glass flex items-center gap-3 rounded-lg px-2.5 py-1.5">
                  <button onClick={() => decrease(item.cartItemId)} className="text-slate-400 hover:text-white"><Minus size={13} /></button>
                  <span className="w-5 text-center text-sm font-semibold text-white">{item.quantity}</span>
                  <button onClick={() => increase(item.cartItemId)} className="text-slate-400 hover:text-white"><Plus size={13} /></button>
                </div>
                <p className="w-24 text-right font-semibold text-white">{money(item.subtotal)}</p>
                <button onClick={() => removeItem(item.cartItemId)} className="text-slate-500 hover:text-rose-400">
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-fit">
        <div className="glass sticky top-28 rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold text-white">Order summary</h3>
          <p className="mt-1 text-xs text-slate-500">
            {selected.size === 0 ? 'All items selected' : `${selected.size} item(s) selected`}
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-white">{money(selectedTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Processing fee</span>
              <span className="text-white">₹0</span>
            </div>
          </div>
          <div className="my-4 h-px bg-white/10" />
          <div className="flex justify-between text-base font-semibold text-white">
            <span>Total</span>
            <span>{money(selectedTotal)}</span>
          </div>
          <button
            onClick={checkout}
            disabled={checkingOut}
            className="btn-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-glow-sm disabled:opacity-60"
          >
            {checkingOut ? 'Placing order…' : 'Checkout'} <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
