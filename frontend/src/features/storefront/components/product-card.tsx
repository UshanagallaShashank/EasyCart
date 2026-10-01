// Product card with image, stock state, price, and a quick add-to-cart action.
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StockBadge } from './stock-badge';
import { QuickAddButton } from './quick-add-button';
import { format_price } from '@/lib/format-price';
import { get_stock_status } from '../utils/get-stock-status';
import type { Product } from '@/features/products/types/product-types';

export function ProductCard({ product, slug }: { product: Product; slug: string }) {
  const status = get_stock_status(product);
  const hasVariants = product.variants.length > 0;
  const fromPrice = hasVariants ? Math.min(product.price, ...product.variants.map((v) => v.price)) : product.price;

  return (
    <Link to={`/${slug}/products/${product.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-900/5 focus-visible:ring-3 focus-visible:ring-sky-500/40 focus-visible:outline-none">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" className={cn('size-full object-cover transition-transform duration-700 group-hover:scale-105', status === 'out' && 'opacity-60 grayscale')} />
        ) : (
          <div className="flex size-full items-center justify-center text-slate-300"><Package className="size-10" /></div>
        )}
        {status !== 'in' && <StockBadge status={status} quantity={product.stock_quantity} className="absolute top-2.5 left-2.5" />}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-slate-800 sm:text-[15px]">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            {hasVariants && <p className="text-[11px] text-slate-500">From</p>}
            <p className="truncate font-heading text-base font-bold text-slate-900 tabular-nums">{format_price(fromPrice)}</p>
          </div>
          {!hasVariants && status !== 'out' && <QuickAddButton product={product} />}
        </div>
      </div>
    </Link>
  );
}
