// Primary sky-blue submit button with press/hover motion and a spinner while loading.
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface AuthSubmitButtonProps {
  isPending: boolean;
  pendingLabel: string;
  children: ReactNode;
  className?: string;
}

export function AuthSubmitButton({ isPending, pendingLabel, children, className = '' }: AuthSubmitButtonProps) {
  return (
    <motion.button
      type="submit"
      disabled={isPending}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0077C8] text-xs font-semibold text-white shadow-md shadow-sky-500/20 transition-colors hover:bg-[#0064AA] hover:shadow-lg hover:shadow-sky-500/30 disabled:opacity-60 ${className}`}
    >
      {isPending && <Loader2 className="size-3.5 animate-spin" />}
      {isPending ? pendingLabel : children}
    </motion.button>
  );
}
