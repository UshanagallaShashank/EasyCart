import { apiRequest } from '@/shared/api/api-client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
  tenant_id?: string | null;
  created_at: string;
}

export function fetchSelfProfile(authType: 'owner' | 'customer' = 'owner'): Promise<{ user: UserProfile }> {
  return apiRequest('/profile', {}, authType);
}

export function updateSelfProfile(
  updates: { username?: string; email?: string; phone_number?: string },
  authType: 'owner' | 'customer' = 'owner'
): Promise<{ user: UserProfile; message: string }> {
  return apiRequest('/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }, authType);
}
