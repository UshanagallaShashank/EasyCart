// Debounced keyword search box for the storefront catalog, with a clear button.
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SEARCH_DELAY_MS = 300;

export function ProductSearchInput({ value, onSearch }: { value: string; onSearch(term: string): void }) {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const timer = useRef<number | undefined>(undefined);

  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value !== draft.trim()) setDraft(value);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function handle_draft_change(next: string) {
    setDraft(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onSearch(next.trim()), next ? SEARCH_DELAY_MS : 0);
  }

  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="search"
        placeholder="Search products"
        aria-label="Search products"
        value={draft}
        onChange={(e) => handle_draft_change(e.target.value)}
        className="h-11 rounded-full border-slate-200 bg-white pr-10 pl-10 shadow-2xs [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button type="button" aria-label="Clear search" onClick={() => handle_draft_change('')} className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
