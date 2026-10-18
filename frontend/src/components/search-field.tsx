// Compact search input with a leading icon, used to filter dashboard lists.
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFieldProps {
  value: string;
  onChange(value: string): void;
  placeholder: string;
  className?: string;
}

export function SearchField({ value, onChange, placeholder, className }: SearchFieldProps) {
  return (
    <div className={cn('relative w-full md:w-64', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:ring-3 focus:ring-sky-500/15"
      />
    </div>
  );
}
