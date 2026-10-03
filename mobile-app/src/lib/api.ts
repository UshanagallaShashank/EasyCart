// The one HTTP client: every call goes to the same backend as the website, with the signed-in token attached.
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');
export const BASE_URL = `${API_URL}/api`;
const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setApiToken(next: string | null) {
  token = next;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export function apiUrl(path: string) {
  return `${BASE_URL}${path}`;
}

// File links are either full addresses (Supabase) or "/api/..." paths served by the backend itself.
export function fileUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('/api/') ? `${API_URL}${url}` : url;
}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  // A phone's request has no time limit of its own, so an unreachable server would hang (and spin) forever.
  const controller = new AbortController();
  const giveUpTimer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(apiUrl(path), { method: options.method ?? 'GET', headers, signal: controller.signal, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
  } catch {
    throw new ApiError(`Cannot reach the server at ${API_URL}. Check your connection and that the phone is on the same Wi-Fi as the computer.`, 0);
  } finally {
    clearTimeout(giveUpTimer);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(data.error ?? 'Something went wrong', res.status);
  }
  return data as T;
}

export function errorMessage(err: unknown, fallback = 'Something went wrong') {
  return err instanceof Error ? err.message : fallback;
}
