// Search text and status view for the products list, plus the filtered rows and per-view counts.
import { useState } from 'react';
import type { Product } from '../types/product-types';

export type ProductView = 'all' | 'active' | 'hidden' | 'low';

const VIEW_TESTS: Record<ProductView, (p: Product) => boolean> = {
  all: () => true,
  active: (p) => p.is_active,
  hidden: (p) => !p.is_active,
  low: (p) => p.stock_quantity <= p.low_stock_threshold
};

export function useProductListFilter(products: Product[]) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ProductView>('all');
  const term = search.trim().toLowerCase();
  const visible = products.filter((p) => VIEW_TESTS[view](p) && (p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)));
  const counts = Object.fromEntries((Object.keys(VIEW_TESTS) as ProductView[]).map((v) => [v, products.filter(VIEW_TESTS[v]).length])) as Record<ProductView, number>;

  return { search, setSearch, view, setView, visible, counts };
}
