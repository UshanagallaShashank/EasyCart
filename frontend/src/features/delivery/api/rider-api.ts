// Calls the delivery partner (rider) endpoints. Riders sign in like store owners, so the staff token is used.
import { apiRequest } from '@/shared/api/api-client';
import type { StaffAuthResponse } from '@/features/auth/types/auth-types';
import type { DocumentKind, Rider, RiderHome, RiderMoney, DailyPoint, Settlement, RiderOrder, RiderProfileFields, OrderSettlementInfo, RiderSettlementSummary } from '../types/delivery-types';

export interface RiderSignupPayload {
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
}

const json = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });

export const registerRider = (payload: RiderSignupPayload): Promise<StaffAuthResponse> => apiRequest('/riders/register', json('POST', payload));
export const getMyRider = (): Promise<{ rider: Rider }> => apiRequest('/riders/me');
export const updateMyProfile = (payload: Partial<RiderProfileFields>): Promise<{ rider: Rider }> => apiRequest('/riders/me', json('PATCH', payload));
export const setBaseLocation = (point: { latitude: number; longitude: number }): Promise<{ rider: Rider }> => apiRequest('/riders/me/base-location', json('PUT', point));
export const uploadDocument = (payload: { kind: DocumentKind; file: string; label?: string }): Promise<{ rider: Rider }> => apiRequest('/riders/me/documents', json('POST', payload));
export const removeOtherDocument = (index: number): Promise<{ rider: Rider }> => apiRequest(`/riders/me/documents/other/${index}`, json('DELETE'));
export const submitApplication = (): Promise<{ rider: Rider }> => apiRequest('/riders/me/submit', json('POST'));

export const setOnline = (payload: { is_online: boolean; latitude?: number; longitude?: number }): Promise<{ rider: Rider }> => apiRequest('/riders/me/online', json('PUT', payload));
export const updateLocation = (point: { latitude: number; longitude: number }): Promise<{ ok: boolean }> => apiRequest('/riders/me/location', json('PUT', point));
export const getRiderHome = (): Promise<RiderHome> => apiRequest('/riders/me/home');
export const getRiderOrder = (id: string): Promise<{ order: RiderOrder }> => apiRequest(`/riders/me/orders/${id}`);
export const getRiderHistory = (): Promise<{ orders: RiderOrder[] }> => apiRequest('/riders/me/history');
export const getRiderEarnings = (): Promise<{ summary: RiderMoney; daily: DailyPoint[]; settlements: Settlement[] }> => apiRequest('/riders/me/earnings');
export const acceptOffer = (id: string): Promise<{ order: RiderOrder }> => apiRequest(`/riders/me/orders/${id}/accept`, json('POST'));
export const declineOffer = (id: string): Promise<{ ok: boolean }> => apiRequest(`/riders/me/orders/${id}/decline`, json('POST'));
export const confirmPickup = (id: string, pickup_code: string): Promise<{ order: RiderOrder }> => apiRequest(`/riders/me/orders/${id}/pickup`, json('POST', { pickup_code }));
export const completeDelivery = (id: string, payload: { delivery_code: string; cash_collected: number; photo: string }): Promise<{ order: RiderOrder }> =>
  apiRequest(`/riders/me/orders/${id}/deliver`, json('POST', payload));
export const payStoreForOrder = (id: string, payload?: { method?: string; note?: string }): Promise<{ ok: boolean; settlement: OrderSettlementInfo }> =>
  apiRequest(`/riders/me/orders/${id}/pay-store`, json('POST', payload ?? {}));
export const getRiderSettlements = (): Promise<RiderSettlementSummary> => apiRequest('/riders/me/settlements');

