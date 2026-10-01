// Platform admin sign-in and passcode-gated sign-up calls.
import { apiRequest } from '@/shared/api/api-client';
import type { LoginPayload, LoginResponse } from '@/features/auth/types/auth-types';
import type { AdminRegisterPayload } from '../types/admin-auth-types';

export function registerAdmin(payload: AdminRegisterPayload): Promise<LoginResponse> {
  return apiRequest('/admin/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function loginAdmin(payload: LoginPayload): Promise<LoginResponse> {
  const result: LoginResponse = await apiRequest('/login', { method: 'POST', body: JSON.stringify(payload) });
  if (result.user.role !== 'platform_admin') throw new Error('This account is not a platform admin. Store owners sign in at /login.');
  return result;
}
