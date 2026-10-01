import { apiRequest } from '@/shared/api/api-client';
import type { BusinessAddress } from '../lib/business-address';

export interface CustomerStoreRequestPayload {
  store_name: string;
  slug: string;
  store_type?: string;
  store_description?: string;
  business_address: BusinessAddress;
  /** Documents as base64 data URLs */
  id_proof: string;
  business_proof: string;
}

export interface CustomerStoreRequestData {
  id: string;
  name: string;
  slug: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  business_address: string | null;
  store_type?: string | null;
  store_description?: string | null;
  id_proof_url?: string | null;
  business_proof_url?: string | null;
  documents?: Array<{
    id: string;
    title: string;
    file_name?: string;
    url: string;
    type?: string;
  }>;
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
