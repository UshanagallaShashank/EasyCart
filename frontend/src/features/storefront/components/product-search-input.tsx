// Text input for searching storefront products by keyword.
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export function ProductSearchInput() {
  const [searchParams, setSearchParams] = useSearchParams();

  function handle_search_change(val: string) {
    const next = new URLSearchParams(searchParams);
    if (val.trim()) next.set('search', val.trim());
    else next.delete('search');
    setSearchParams(next);
  }

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      <Input
        placeholder="Search products…"
        className="pl-9 bg-white border-slate-200 shadow-2xs"
        defaultValue={searchParams.get('search') ?? ''}
        onChange={(e) => handle_search_change(e.target.value)}
      />
    </div>
  );
}
