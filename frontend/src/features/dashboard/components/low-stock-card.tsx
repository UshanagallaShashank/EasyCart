// Products that are at or below their low-stock threshold.
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Product } from '@/features/products/types/product-types';

export function LowStockCard({ products }: { products: Product[] }) {
  return (
    <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <AlertTriangle className="size-4 text-amber-500" /> Low stock
      </h2>
      {!products.length ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <CheckCircle2 className="size-8 text-emerald-400" />
          <p className="text-xs text-slate-500">All products are well stocked.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {products.slice(0, 5).map((product) => (
            <li key={product.id}>
              <Link
                to="/dashboard/products"
                className="flex items-center justify-between gap-3 rounded-lg bg-amber-50/60 px-3 py-2 text-sm transition-colors hover:bg-amber-50"
              >
                <span className="truncate text-slate-700">{product.name}</span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-amber-600">{product.stock_quantity <= 0 ? 'Out of stock' : `${product.stock_quantity} left`}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
