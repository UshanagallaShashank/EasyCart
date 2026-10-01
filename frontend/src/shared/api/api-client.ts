// The one centralized HTTP client — every API call routes through this.
import { ApiError } from './api-error';
import { getToken as getOwnerToken } from '../auth/token-storage';
import { getToken as getCustomerToken } from '../customer-auth/token-storage';

export type AuthType = 'owner' | 'customer';

// A trailing slash on the address ("https://api.example.com/") would give "//api" paths, so drop it.
function removeTrailingSlashes(address: string): string {
  let result = address;
  while (result.endsWith('/')) result = result.slice(0, -1);
  return result;
}

const BASE_URL = `${removeTrailingSlashes(String(import.meta.env.VITE_API_BASE_URL))}/api`;

const tokenGetters: Record<AuthType, () => string | null> = {
  owner: getOwnerToken,
  customer: getCustomerToken
};

const onUnauthorized: Record<AuthType, (() => void) | null> = { owner: null, customer: null };

export function setUnauthorizedHandler(handler: () => void, authType: AuthType = 'owner'): void {
  onUnauthorized[authType] = handler;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, authType: AuthType = 'owner'): Promise<T> {
  const token = tokenGetters[authType]();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) onUnauthorized[authType]?.();
    throw new ApiError(body.error ?? 'Something went wrong', res.status);
  }
  return body as T;
}
