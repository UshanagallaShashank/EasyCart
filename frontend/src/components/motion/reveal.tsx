// Small animation helpers built on motion: fade-and-rise on scroll, and staggered lists.
import type { ReactNode } from 'react';
import { motion } from 'motion/react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Fades and lifts its content into view the first time it scrolls on screen.
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.3, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT } }
};

// Wrap children in StaggerItem; they appear one after another when the list scrolls into view.
export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={listVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
