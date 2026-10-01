// Horizontally scrollable category chips for filtering storefront products.
import { cn } from '@/lib/utils';
import { usePublicCategories } from '../hooks/use-public-categories';

interface CategoryFilterProps {
  slug: string;
  value: string;
  onChange(categoryId: string): void;
}

export function CategoryFilter({ slug, value, onChange }: CategoryFilterProps) {
  const { data: categories } = usePublicCategories(slug);
  if (!categories?.length) return null;
  const options = [{ id: '', name: 'All' }, ...categories];

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="tablist" aria-label="Categories">
      {options.map((c) => (
        <button
          key={c.id || 'all'}
          type="button"
          role="tab"
          aria-selected={value === c.id}
          onClick={() => onChange(c.id)}
          className={cn(
            'h-9 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors',
            value === c.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
