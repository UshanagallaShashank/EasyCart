import { apiRequest } from '@/shared/api/api-client';
import type { CheckoutPayload } from '../types/checkout-types';
import type { Order } from '@/features/orders/types/order-types';

export function checkout(slug: string, payload: CheckoutPayload): Promise<{ order: Order }> {
  return apiRequest(`/stores/${slug}/checkout`, { method: 'POST', body: JSON.stringify(payload) }, 'customer');
}
