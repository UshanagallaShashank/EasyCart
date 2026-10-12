// The one HTTP client: every call goes to the same backend as the website, with the signed-in token attached.
import { reportServerReachable, reportServerUnreachable } from './connection';
import { remoteLog } from './remote-log';
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');
export const BASE_URL = `${API_URL}/api`;
const REQUEST_TIMEOUT_MS = 15_000;

// Logs show in the Expo terminal while developing. They never include passwords, tokens or request bodies.
function log(message: string) {
  if (__DEV__) console.log(`[api] ${message}`);
}

log(`Server address: ${BASE_URL}`);

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

// True once someone is signed in (used to pick which translation route to call).
export function hasApiToken() {
  return token !== null;
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

  const method = options.method ?? 'GET';
  const startedAt = Date.now();
  let res: Response;
  try {
    res = await fetch(apiUrl(path), { method, headers, signal: controller.signal, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
  } catch (err) {
    const reason = controller.signal.aborted ? `no answer after ${REQUEST_TIMEOUT_MS / 1000}s` : String(err);
    log(`${method} ${path} FAILED to connect (${reason})`);
    reportServerUnreachable();
    remoteLog('warn', 'Server unreachable', { method, path, reason });
    throw new ApiError(`Cannot reach the server at ${API_URL}. Check your connection and that the phone is on the same Wi-Fi as the computer.`, 0);
  } finally {
    clearTimeout(giveUpTimer);
  }
  const data = await res.json().catch(() => ({}));
  const tookMs = Date.now() - startedAt;
  log(`${method} ${path} -> ${res.status} (${tookMs}ms)${res.ok ? '' : ` ${data.error ?? ''}`}`);
  // A host whose app is down answers 502, 503 or 504 by itself, so those count as the server being away too.
  const serverAway = res.status >= 502 && res.status <= 504;
  if (serverAway) reportServerUnreachable();
  else reportServerReachable();
  if (res.status >= 500) remoteLog('error', 'Server error', { method, path, status: res.status, tookMs });
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(data.error ?? 'Something went wrong', res.status);
  }
  return data as T;
}

export function errorMessage(err: unknown, fallback = 'Something went wrong') {
  return err instanceof Error ? err.message : fallback;
}
