// Floating bar shown while a settings form has unsaved edits, with Discard and Save actions.
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';

interface UnsavedChangesBarProps {
  visible: boolean;
  isSaving: boolean;
  onDiscard(): void;
}

export function UnsavedChangesBar({ visible, isSaving, onDiscard }: UnsavedChangesBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={{ duration: 0.2 }} className="safe-bottom pointer-events-none sticky bottom-0 z-20 px-4 pb-4 md:px-8">
          <div className="pointer-events-auto mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl bg-slate-900 py-2.5 pr-2.5 pl-4 text-white shadow-xl shadow-slate-900/20">
            <p className="text-sm font-medium whitespace-nowrap">Unsaved<span className="hidden sm:inline"> changes</span></p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onDiscard} disabled={isSaving} className="h-9 text-slate-300 hover:bg-white/10 hover:text-white">Discard</Button>
              <Button type="submit" disabled={isSaving} className="h-9 bg-white px-4 text-slate-900 hover:bg-slate-100">{isSaving ? 'Saving…' : 'Save changes'}</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
