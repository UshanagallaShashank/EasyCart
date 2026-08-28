import { apiRequest } from '@/shared/api/api-client';
import type { Store, StoreSettingsPayload } from '../types/store-types';

export function getOwnStore(): Promise<{ store: Store }> {
  return apiRequest('/stores/me');
}

export function updateStoreSettings(payload: StoreSettingsPayload): Promise<{ store: Store }> {
  return apiRequest('/stores/me', { method: 'PATCH', body: JSON.stringify(payload) });
}

export function publishStore(): Promise<{ store: Store }> {
  return apiRequest('/stores/me/publish', { method: 'POST' });
}

export function unpublishStore(): Promise<{ store: Store }> {
  return apiRequest('/stores/me/unpublish', { method: 'POST' });
}
