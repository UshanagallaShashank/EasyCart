// Small square product image with a package-icon fallback.
import { Package } from 'lucide-react';
import type { Product } from '../types/product-types';

export function ProductThumb({ product }: { product: Product }) {
  if (product.images?.[0]) {
    return <img src={product.images[0]} alt="" className="size-11 shrink-0 rounded-lg bg-slate-100 object-cover ring-1 ring-slate-200/80" />;
  }
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
      <Package className="size-5" />
    </span>
  );
}
