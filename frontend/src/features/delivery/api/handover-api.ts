// The store's and the customer's views of one order's delivery, and the store's delivery actions.
import { apiRequest } from '@/shared/api/api-client';
import type { CustomerOrderDelivery, NearbyRider, StoreDeliveryRow, StoreOrderDelivery } from '../types/delivery-types';

type StoreAction = 'request-rider' | 'cancel-rider' | 'new-pickup-code' | 'new-delivery-code';

export const getStoreOrderDelivery = (id: string): Promise<{ delivery: StoreOrderDelivery }> => apiRequest(`/orders/${id}/delivery`);
export const runStoreDeliveryAction = (id: string, action: StoreAction): Promise<{ delivery: StoreOrderDelivery }> => apiRequest(`/orders/${id}/delivery/${action}`, { method: 'POST' });
export const getRidersNearby = (): Promise<{ store_location: { latitude: number; longitude: number; address_line: string | null } | null; riders: NearbyRider[] }> => apiRequest('/delivery/riders-nearby');
export const getStoreDeliveries = (): Promise<{ deliveries: StoreDeliveryRow[] }> => apiRequest('/delivery/orders');

export const getCustomerOrderDelivery = (id: string): Promise<{ delivery: CustomerOrderDelivery }> => apiRequest(`/my-orders/${id}/delivery`, {}, 'customer');

export type { StoreAction };
