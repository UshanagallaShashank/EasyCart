import { apiRequest } from '@/shared/api/api-client';
import type { RegisterPayload, LoginPayload, RegisterResponse, LoginResponse } from '../types/auth-types';

export function registerOwner(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiRequest('/register', { method: 'POST', body: JSON.stringify(payload) });
}

export function loginOwner(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest('/login', { method: 'POST', body: JSON.stringify(payload) });
}
