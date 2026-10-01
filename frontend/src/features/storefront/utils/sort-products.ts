// Returns a sorted copy of storefront products for the chosen sort option.
import type { Product } from '@/features/products/types/product-types';

export type ProductSort = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';

const COMPARATORS: Record<Exclude<ProductSort, 'featured'>, (a: Product, b: Product) => number> = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name)
};

export function sort_products(products: Product[], sort: ProductSort): Product[] {
  if (sort === 'featured') return products;
  return [...products].sort(COMPARATORS[sort]);
}
