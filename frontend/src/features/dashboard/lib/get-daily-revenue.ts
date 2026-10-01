// Buckets non-cancelled orders into per-day revenue totals for the last N days, oldest first.
import type { Order } from '@/features/orders/types/order-types';

export interface DailyRevenue {
  key: string;
  label: string;
  fullLabel: string;
  total: number;
  orders: number;
}

function to_day_key(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function get_daily_revenue(orders: Order[], days = 7): DailyRevenue[] {
  const buckets = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return { key: to_day_key(date), label: date.toLocaleDateString(undefined, { weekday: 'short' }), fullLabel: date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }), total: 0, orders: 0 };
  });
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const order of orders) {
    const bucket = byKey.get(to_day_key(new Date(order.created_at)));
    if (!bucket || order.status === 'cancelled') continue;
    bucket.total += order.total;
    bucket.orders += 1;
  }
  return buckets;
}
