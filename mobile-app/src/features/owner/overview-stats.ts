// The numbers on the owner overview (same rules as the website's dashboard).
import type { Order } from '@/types/order';
import type { Product } from '@/types/catalog';

// Cancelled orders never count as money earned.
export function getRevenue(orders: Order[]): number {
  return orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + Number(order.total), 0);
}

export function getPendingCount(orders: Order[]): number {
  return orders.filter((order) => order.status === 'pending').length;
}

export function getLowStock(products: Product[]): Product[] {
  return products.filter((product) => product.stock_quantity <= product.low_stock_threshold);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// ---- Insights worked out from the orders the app already has (nothing extra is stored).

export interface BestSeller { name: string; quantity: number; revenue: number }

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Orders placed today and the money they bring in (cancelled ones don't count).
export function getToday(orders: Order[]): { orders: number; revenue: number } {
  const now = new Date();
  const today = orders.filter((order) => order.status !== 'cancelled' && isSameDay(new Date(order.created_at), now));
  return { orders: today.length, revenue: today.reduce((sum, order) => sum + Number(order.total), 0) };
}

// The products customers buy most, by units sold.
export function getBestSellers(orders: Order[], limit = 5): BestSeller[] {
  const totals = new Map<string, BestSeller>();
  for (const order of orders) {
    if (order.status === 'cancelled') continue;
    for (const item of order.items) {
      const known = totals.get(item.name) ?? { name: item.name, quantity: 0, revenue: 0 };
      known.quantity += item.quantity;
      known.revenue += item.price * item.quantity;
      totals.set(item.name, known);
    }
  }
  return [...totals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, limit);
}

// The hour of the day with the most orders, like "7 PM". Null when there are no orders yet.
export function getBusiestHour(orders: Order[]): string | null {
  const perHour = new Array<number>(24).fill(0);
  for (const order of orders) {
    if (order.status === 'cancelled') continue;
    perHour[new Date(order.created_at).getHours()] += 1;
  }
  const most = Math.max(...perHour);
  if (most === 0) return null;
  const hour = perHour.indexOf(most);
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${hour < 12 ? 'AM' : 'PM'}`;
}

// Share of customers who ordered more than once, as a whole percent. Null when there are no customers yet.
export function getRepeatRate(orders: Order[]): number | null {
  const ordersPerCustomer = new Map<string, number>();
  for (const order of orders) {
    if (order.status === 'cancelled') continue;
    ordersPerCustomer.set(order.customer_id, (ordersPerCustomer.get(order.customer_id) ?? 0) + 1);
  }
  if (ordersPerCustomer.size === 0) return null;
  const repeat = [...ordersPerCustomer.values()].filter((count) => count > 1).length;
  return Math.round((repeat / ordersPerCustomer.size) * 100);
}
