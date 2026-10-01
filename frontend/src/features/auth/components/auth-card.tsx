// Frosted floating card used by every auth page; springs up into place and staggers its children.
import type { ReactNode } from 'react';
import { motion } from 'motion/react';

interface AuthCardProps {
  children: ReactNode;
  maxWidth?: string;
}

export function AuthCard({ children, maxWidth = 'max-w-[390px]' }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className={`flex w-full ${maxWidth} flex-col gap-4 rounded-3xl border border-white/90 bg-white/85 p-6 shadow-[0_20px_60px_-15px_rgba(2,132,199,0.18)] backdrop-blur-xl sm:p-8`}
    >
      {children}
    </motion.div>
  );
}
