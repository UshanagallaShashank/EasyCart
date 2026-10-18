// Stock count with a colored dot: green when healthy, amber when low, red when out.
import { cn } from '@/lib/utils';
import type { Product } from '../types/product-types';

export function ProductStockLabel({ product }: { product: Product }) {
  const out = product.stock_quantity <= 0;
  const low = !out && product.stock_quantity <= product.low_stock_threshold;
  const dot = out ? 'bg-rose-500' : low ? 'bg-amber-500' : 'bg-emerald-500';
  const text = out ? 'Out of stock' : `${product.stock_quantity} in stock`;

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm tabular-nums', out ? 'font-medium text-rose-600' : low ? 'font-medium text-amber-700' : 'text-slate-600')}>
      <span className={cn('size-1.5 rounded-full', dot)} /> {text}
    </span>
  );
}
