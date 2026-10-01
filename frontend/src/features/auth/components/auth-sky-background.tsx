// Serene sky background with soft clouds drifting slowly and ambient orbital arcs
import { motion } from 'motion/react';

// Each cloud drifts sideways and bobs up and down forever, at its own pace.
function Cloud({ className, drift, seconds }: { className: string; drift: number; seconds: number }) {
  return (
    <motion.div
      className={className}
      animate={{ x: [0, drift, 0], y: [0, -12, 0] }}
      transition={{ duration: seconds, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function AuthSkyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-gradient-to-b from-[#BEE3FD] via-[#D8ECFE] to-[#EFF7FE]">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-white/60"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] rounded-full border border-white/40"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] rounded-full border border-white/25" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[120%] h-96 bg-white/70 rounded-[100%] blur-3xl" />
      <Cloud className="absolute -bottom-16 -left-20 w-[600px] h-[400px] bg-white/60 rounded-full blur-2xl" drift={60} seconds={14} />
      <Cloud className="absolute -bottom-20 -right-20 w-[600px] h-[400px] bg-white/60 rounded-full blur-2xl" drift={-60} seconds={17} />
      <Cloud className="absolute top-12 left-1/4 w-96 h-48 bg-white/40 rounded-full blur-3xl" drift={90} seconds={20} />
      <Cloud className="absolute top-32 right-1/4 w-72 h-36 bg-white/30 rounded-full blur-3xl" drift={-70} seconds={16} />
    </div>
  );
}
