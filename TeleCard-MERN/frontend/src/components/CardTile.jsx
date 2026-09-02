import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Zap } from 'lucide-react';

const NETWORK_GRADIENTS = {
  VISA: 'from-[#3b2fd9] via-[#5a3fef] to-[#1f8fff]',
  MASTERCARD: 'from-[#eb5b28] via-[#d6224a] to-[#f6a509]',
  RUPAY: 'from-[#0f8f5f] via-[#0c6f9c] to-[#123f7a]',
  AMEX: 'from-[#0a5c6e] via-[#0f7d8f] to-[#0a3f5c]',
  DEFAULT: 'from-brand-700 via-brand-500 to-accent-500',
};

function money(n) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function CardTile({ card, index = 0 }) {
  const gradient = NETWORK_GRADIENTS[card.cardNetwork?.toUpperCase()] || NETWORK_GRADIENTS.DEFAULT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link to={`/cards/${card.id}`} className="block">
        <div className="glass card-shine relative overflow-hidden rounded-3xl p-5 transition-shadow duration-300 hover:shadow-glow-sm">
          <div
            className={`relative flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-card`}
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="relative flex items-start justify-between">
              <span className="rounded-md bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                {card.cardType}
              </span>
              <span className="font-display text-sm font-bold uppercase tracking-widest text-white/90">
                {card.cardNetwork}
              </span>
            </div>
            <div className="relative">
              <div className="mb-2 h-6 w-9 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 opacity-90" />
              <p className="font-mono text-sm tracking-[0.25em] text-white/85">•••• •••• •••• {String(card.id).slice(-4).padStart(4, '0')}</p>
            </div>
            <div className="relative flex items-end justify-between">
              <p className="max-w-[70%] truncate text-base font-semibold text-white">{card.cardName}</p>
              <p className="text-xs text-white/70">{card.validity || 'Lifetime'}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Starting at</p>
              <p className="text-lg font-bold text-white">{money(card.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              {card.stock > 0 && card.stock <= 5 && (
                <span className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-1 text-[10px] font-medium text-orange-300">
                  <Zap size={11} /> {card.stock} left
                </span>
              )}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-all duration-300 group-hover:bg-brand-500 group-hover:text-white">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export { money };
