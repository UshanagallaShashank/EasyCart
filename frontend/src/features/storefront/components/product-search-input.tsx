import { Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export function ProductSearchInput() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';

  function handle_search_change(val: string) {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set('search', val);
    } else {
      next.delete('search');
    }
    setSearchParams(next, { replace: true });
  }

  function handle_clear() {
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      <Input
        placeholder="Search products…"
        className="pl-9 pr-8 bg-white border-slate-200 shadow-2xs"
        value={search}
        onChange={(e) => handle_search_change(e.target.value)}
      />
      {search && (
        <button
          type="button"
          onClick={handle_clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
