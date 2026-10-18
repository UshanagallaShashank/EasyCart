import { apiRequest } from '@/shared/api/api-client';
import type { CheckoutPayload } from '../types/checkout-types';
import type { Order } from '@/features/orders/types/order-types';

export interface ValidatedCoupon {
  id?: string;
  code: string;
  discount_type: 'flat' | 'percent';
  discount_value: number;
}

export function checkout(slug: string, payload: CheckoutPayload): Promise<{ order: Order }> {
  return apiRequest(`/stores/${slug}/checkout`, { method: 'POST', body: JSON.stringify(payload) }, 'customer');
}

export function validateCoupon(slug: string, code: string): Promise<{ valid: boolean; coupon: ValidatedCoupon }> {
  return apiRequest(`/stores/${slug}/coupons/validate`, { method: 'POST', body: JSON.stringify({ code }) }, 'customer');
}

