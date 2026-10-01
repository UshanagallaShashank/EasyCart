import type { Order } from '../types/order-types';
import { format_price } from '@/lib/format-price';

// A customer can only cancel before the store has started working on the order.
export function canCustomerCancel(order: Order): boolean {
  return order.status === 'pending' && order.fulfillment_status === 'not_started';
}

export function formatMoney(amount: number): string {
  return format_price(amount);
}

export function formatOrderDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function shortOrderId(id: string): string {
  return `#${id.slice(0, 8)}`;
}
