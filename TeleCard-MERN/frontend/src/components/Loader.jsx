import { motion } from 'framer-motion';

export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="relative h-14 w-14">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-brand-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
        />
        <motion.span
          className="absolute inset-2 rounded-full border-2 border-accent-500"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
        />
      </div>
      <p className="text-sm text-slate-400 tracking-wide">{label}…</p>
    </div>
  );
}
