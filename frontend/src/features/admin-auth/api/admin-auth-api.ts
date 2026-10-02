// Platform admin passcode-gated sign-up call (sign-in is shared: see features/auth/hooks/use-login.ts).
import { apiRequest } from '@/shared/api/api-client';
import type { StaffAuthResponse } from '@/features/auth/types/auth-types';
import type { AdminRegisterPayload } from '../types/admin-auth-types';

export function registerAdmin(payload: AdminRegisterPayload): Promise<StaffAuthResponse> {
  return apiRequest('/admin/register', { method: 'POST', body: JSON.stringify(payload) });
}
