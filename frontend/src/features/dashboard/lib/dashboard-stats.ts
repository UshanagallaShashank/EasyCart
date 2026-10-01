import type { Order } from '@/features/orders/types/order-types';
import type { Product } from '@/features/products/types/product-types';

// Cancelled orders never count as money earned.
export function getRevenue(orders: Order[]): number {
  return orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0);
}

export function getPendingCount(orders: Order[]): number {
  return orders.filter((order) => order.status === 'pending').length;
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter((product) => product.stock_quantity <= product.low_stock_threshold);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
