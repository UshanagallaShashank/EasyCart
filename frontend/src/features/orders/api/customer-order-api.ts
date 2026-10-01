import { apiRequest } from '@/shared/api/api-client';
import type { Order } from '../types/order-types';

export function getMyOrders(): Promise<{ orders: Order[] }> {
  return apiRequest('/my-orders', {}, 'customer');
}

export function getMyOrder(id: string): Promise<{ order: Order }> {
  return apiRequest(`/my-orders/${id}`, {}, 'customer');
}

export function cancelMyOrder(id: string): Promise<{ order: Order }> {
  return apiRequest(`/my-orders/${id}/cancel`, { method: 'PATCH' }, 'customer');
}
