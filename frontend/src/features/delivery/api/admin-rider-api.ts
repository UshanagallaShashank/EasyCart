// Platform admin endpoints for delivery partners and deliveries.
import { apiRequest } from '@/shared/api/api-client';
import type { AdminDeliveryRow, AdminRiderDetail, AdminRiderList } from '../types/delivery-types';

const post = (body?: unknown): RequestInit => ({ method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export const listAdminRiders = (near?: string): Promise<AdminRiderList> => apiRequest(`/admin/riders${near ? `?near=${encodeURIComponent(near)}` : ''}`);
export const getAdminRider = (id: string): Promise<AdminRiderDetail> => apiRequest(`/admin/riders/${id}`);
export const approveRider = (id: string, note?: string): Promise<AdminRiderDetail> => apiRequest(`/admin/riders/${id}/approve`, post({ note }));
export const rejectRider = (id: string, note: string): Promise<AdminRiderDetail> => apiRequest(`/admin/riders/${id}/reject`, post({ note }));
export const suspendRider = (id: string, note: string): Promise<AdminRiderDetail> => apiRequest(`/admin/riders/${id}/suspend`, post({ note }));
export const reactivateRider = (id: string): Promise<AdminRiderDetail> => apiRequest(`/admin/riders/${id}/reactivate`, post());
export const recordSettlement = (id: string, payload: { kind: 'cash_deposit' | 'payout'; amount: number; note?: string }): Promise<AdminRiderDetail> =>
  apiRequest(`/admin/riders/${id}/settlements`, post(payload));
export const listAdminDeliveries = (): Promise<{ deliveries: AdminDeliveryRow[] }> => apiRequest('/admin/deliveries');
