import type { Order } from '../types/order-types';

// A customer can only cancel before the store has started working on the order.
export function canCustomerCancel(order: Order): boolean {
  return order.status === 'pending' && order.fulfillment_status === 'not_started';
}

export function formatMoney(amount: number): string {
  return `Rs. ${amount.toFixed(2)}`;
}

export function formatOrderDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function shortOrderId(id: string): string {
  return `#${id.slice(0, 8)}`;
}
