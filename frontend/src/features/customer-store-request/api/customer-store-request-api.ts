import { apiRequest } from '@/shared/api/api-client';

export interface CustomerStoreRequestPayload {
  store_name: string;
  slug: string;
  description?: string;
}

export interface CustomerStoreRequestData {
  id: string;
  name: string;
  slug: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  description: string | null;
}

export function requestStoreCreation(payload: CustomerStoreRequestPayload): Promise<{
  success: boolean;
  message: string;
  request: CustomerStoreRequestData;
}> {
  return apiRequest(
    '/customers/store-request',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    'customer'
  );
}

export function getMyStoreRequest(): Promise<{
  request: CustomerStoreRequestData | null;
}> {
  return apiRequest('/customers/store-request', { method: 'GET' }, 'customer');
}
