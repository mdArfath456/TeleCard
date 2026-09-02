import { motion } from 'framer-motion';

// Ambient animated mesh-gradient blobs + grid used behind most pages.
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-base-950">
      <div className="absolute inset-0 bg-grid-lines bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <motion.div
        className="absolute -top-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-brand-600/30 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-accent-500/20 blur-[120px]"
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-brand-400/15 blur-[130px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="noise-overlay" />
    </div>
  );
}
