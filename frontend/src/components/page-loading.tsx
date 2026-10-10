// Lightweight placeholder shown for the split second while a page's code downloads.
import { Loader2 } from 'lucide-react';

export function PageLoading() {
  return (
    <div className="flex min-h-[40vh] flex-1 items-center justify-center" role="status" aria-label="Loading page">
      <Loader2 className="size-6 animate-spin text-slate-300" />
    </div>
  );
}
