// Slide-in drawer that shows a sidebar on phones and tablets, with a backdrop and close button.
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export function MobileNavDrawer({ open, onClose, children }: { open: boolean; onClose(): void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
            {children}
            <button onClick={onClose} aria-label="Close menu" className="absolute top-5 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-4" /></button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
