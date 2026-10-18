import { apiRequest } from '@/shared/api/api-client';
import type { Coupon, CouponPayload } from '../types/coupon-types';

export function listCoupons(): Promise<{ coupons: Coupon[] }> {
  return apiRequest('/coupons');
}

export function createCoupon(payload: CouponPayload): Promise<{ coupon: Coupon }> {
  return apiRequest('/coupons', { method: 'POST', body: JSON.stringify(payload) });
}

export function setCouponActive(id: string, is_active: boolean): Promise<{ coupon: Coupon }> {
  return apiRequest(`/coupons/${id}`, { method: 'PATCH', body: JSON.stringify({ is_active }) });
}

export function deleteCoupon(id: string): Promise<{ message: string }> {
  return apiRequest(`/coupons/${id}`, { method: 'DELETE' });
}
