// Maps order/payment/stock status values to a shared Badge visual treatment.
import type { Order } from '@/features/orders/types/order-types';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

const ORDER_STATUS_TONE: Record<Order['status'], StatusTone> = {
  pending: 'warning',
  confirmed: 'neutral',
  fulfilled: 'success',
  cancelled: 'danger'
};

export function getOrderStatusTone(status: Order['status']): StatusTone {
  return ORDER_STATUS_TONE[status];
}

export function getPaymentStatusTone(status: Order['payment_status']): StatusTone {
  return status === 'paid' ? 'success' : 'warning';
}

export function getStockTone(quantity: number, threshold: number): StatusTone {
  return quantity <= threshold ? 'danger' : 'neutral';
}

export function getTenantStatusTone(status: 'active' | 'suspended'): StatusTone {
  return status === 'active' ? 'success' : 'danger';
}

export function getFulfillmentStatusTone(status: Order['fulfillment_status']): StatusTone {
  if (status === 'delivered' || status === 'picked_up') return 'success';
  if (status === 'not_started') return 'neutral';
  return 'warning';
}

export const STATUS_TONE_CLASSNAME: Record<StatusTone, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
  neutral: 'bg-secondary text-secondary-foreground'
};
