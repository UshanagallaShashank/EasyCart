// Small pill describing a product's stock state (in stock, only a few left, sold out).
import { cn } from '@/lib/utils';
import type { StockStatus } from '../utils/get-stock-status';

const STOCK_STYLES: Record<StockStatus, string> = {
  in: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  low: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  out: 'bg-slate-900/80 text-white ring-transparent'
};

export function StockBadge({ status, quantity, className }: { status: StockStatus; quantity?: number; className?: string }) {
  const label = status === 'out' ? 'Sold out' : status === 'low' ? `Only ${quantity} left` : 'In stock';
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 backdrop-blur-sm', STOCK_STYLES[status], className)}>
      <span className={cn('size-1.5 rounded-full', status === 'in' ? 'bg-emerald-500' : status === 'low' ? 'bg-amber-500' : 'bg-white/70')} />
      {label}
    </span>
  );
}
