// The one centralized HTTP client — every API call routes through this.
import { ApiError } from './api-error';
import { getToken } from '../auth/token-storage';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.();
    throw new ApiError(body.error ?? 'Something went wrong', res.status);
  }
  return body as T;
}
