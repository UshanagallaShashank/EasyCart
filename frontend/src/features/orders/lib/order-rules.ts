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

// Where the store may move an order next, matching the server's rules: closed orders never reopen,
// a rider-handled order is fulfilled only by the rider's handover, and cannot be cancelled once the rider has it.
const NEXT_STATUS: Record<Order['status'], Order['status'][]> = {
  pending: ['confirmed', 'fulfilled', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: []
};

export function allowedStatuses(order: Order): Order['status'][] {
  const riderHandled = isRiderHandled(order);
  const next = NEXT_STATUS[order.status].filter((status) => {
    if (status === 'fulfilled' && riderHandled && order.fulfillment_status !== 'delivered') return false;
    if (status === 'cancelled' && order.rider_id && order.fulfillment_status === 'dispatched') return false;
    return true;
  });
  return [order.status, ...next];
}

export function isClosed(order: Order): boolean {
  return order.status === 'fulfilled' || order.status === 'cancelled';
}
