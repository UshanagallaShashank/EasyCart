// Full-width primary submit button for auth forms, with a spinner while the request runs.
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthSubmitButtonProps {
  isPending: boolean;
  pendingLabel: string;
  children: ReactNode;
  className?: string;
}

export function AuthSubmitButton({ isPending, pendingLabel, children, className = '' }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:ring-3 focus-visible:ring-sky-500/40 focus-visible:outline-none active:scale-[0.99] disabled:opacity-60 ${className}`}
    >
      {isPending && <Loader2 className="size-4 animate-spin" />}
      {isPending ? pendingLabel : children}
    </button>
  );
}
