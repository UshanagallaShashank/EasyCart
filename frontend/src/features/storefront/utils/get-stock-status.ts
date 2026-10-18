// Classifies a product's available stock as in stock, running low, or sold out.
import type { Product } from '@/features/products/types/product-types';

export type StockStatus = 'in' | 'low' | 'out';

export function get_stock_status(product: Pick<Product, 'stock_quantity' | 'low_stock_threshold'>): StockStatus {
  if (product.stock_quantity === undefined || product.stock_quantity === null) return 'in';
  if (product.stock_quantity <= 0) return 'out';
  if (product.stock_quantity <= (product.low_stock_threshold ?? 0)) return 'low';
  return 'in';
}
