import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Sparkles, ArrowRight, Layers } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CardTile from '../components/CardTile';
import Loader from '../components/Loader';

const FEATURES = [
  { icon: ShieldCheck, title: 'Verified & secure', desc: 'Manual UPI verification with screenshot proof keeps every order accountable.' },
  { icon: Zap, title: 'Instant cart to order', desc: 'Pick your cards, checkout in seconds, and track fulfillment in real time.' },
  { icon: Layers, title: 'Credit, debit & business', desc: 'One catalog spanning every card type across every major network.' },
];

export default function Home() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/cards')
      .then(({ data }) => setCards(data.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative flex flex-col items-center pb-20 pt-10 text-center">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-slate-300"
        >
          <Sparkles size={13} className="text-accent-400" /> Now live — instant card marketplace
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-display max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-6xl"
        >
          Premium cards, <span className="text-gradient">delivered instantly</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-5 max-w-xl text-base text-slate-400"
        >
          Browse credit, debit and business cards, pay securely, and track your order from checkout to fulfillment — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/cards"
            className="btn-glow flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-glow-sm"
          >
            Explore cards <ArrowRight size={16} />
          </Link>
          {!user && (
            <Link
              to="/register"
              className="glass rounded-xl px-6 py-3 text-sm font-semibold text-slate-200 hover:text-white"
            >
              Create free account
            </Link>
          )}
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-10 top-24 hidden rotate-6 md:block"
        >
          <div className="h-40 w-64 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 opacity-30 blur-2xl" />
        </motion.div>
      </section>

      <section className="mb-20 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600/40 to-accent-500/30">
              <f.icon size={18} className="text-accent-400" />
            </div>
            <h3 className="font-semibold text-white">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Featured cards</h2>
            <p className="mt-1 text-sm text-slate-400">Hand-picked from our latest catalog</p>
          </div>
          <Link to="/cards" className="hidden text-sm font-medium text-brand-400 hover:text-brand-300 sm:block">
            View all →
          </Link>
        </div>

        {loading ? (
          <Loader label="Loading cards" />
        ) : cards.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-slate-400">No cards published yet — check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => (
              <CardTile key={c.id} card={c} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
