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

// Once a rider search starts, the rider's pickup and delivery checks move the order on, not the store's dropdowns.
export function isRiderHandled(order: Order): boolean {
  return Boolean(order.rider_id) || order.fulfillment_status === 'ready_for_delivery' || order.fulfillment_status === 'rider_assigned';
}
