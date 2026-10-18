import { apiRequest } from '@/shared/api/api-client';
import type { Order } from '../types/order-types';

export function listOrders(): Promise<{ orders: Order[] }> {
  return apiRequest('/orders');
}

export function getOrder(id: string): Promise<{ order: Order }> {
  return apiRequest(`/orders/${id}`);
}

export function updateOrderStatus(id: string, status: Order['status']): Promise<{ order: Order }> {
  return apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function updateOrderPaymentStatus(id: string, payment_status: Order['payment_status']): Promise<{ order: Order }> {
  return apiRequest(`/orders/${id}/payment-status`, { method: 'PATCH', body: JSON.stringify({ payment_status }) });
}

export function updateOrderFulfillmentStatus(id: string, fulfillment_status: Order['fulfillment_status']): Promise<{ order: Order }> {
  return apiRequest(`/orders/${id}/fulfillment-status`, { method: 'PATCH', body: JSON.stringify({ fulfillment_status }) });
}

export function updateOrderAssignment(id: string, assigned_to: string | null): Promise<{ order: Order }> {
  return apiRequest(`/orders/${id}/assignment`, { method: 'PATCH', body: JSON.stringify({ assigned_to }) });
}
