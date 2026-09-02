import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <CreditCard size={48} className="text-slate-700" />
      </motion.div>
      <h1 className="font-display mt-6 text-4xl font-bold text-white">404</h1>
      <p className="mt-2 text-slate-400">This page seems to have been declined.</p>
      <Link to="/" className="btn-glow mt-6 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm">
        Back home
      </Link>
    </div>
  );
}
