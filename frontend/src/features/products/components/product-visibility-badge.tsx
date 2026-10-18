// Pill showing whether a product is visible in the storefront.
import { cn } from '@/lib/utils';

export function ProductVisibilityBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
      {isActive ? 'Active' : 'Hidden'}
    </span>
  );
}
