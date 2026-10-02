import { apiRequest } from '@/shared/api/api-client';
import type { LoginPayload, LoginResponse } from '../types/auth-types';

export function loginOwner(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest('/login', { method: 'POST', body: JSON.stringify(payload) });
}
