// Sends the app's warnings and errors to an outside log service (for example Better Stack's free plan), so problems
// on real phones can be read without a cable. Off unless EXPO_PUBLIC_LOG_INGEST_URL and EXPO_PUBLIC_LOG_INGEST_TOKEN are set.
// Entries are batched, and never include passwords, tokens or request bodies.
import { Platform } from 'react-native';

type Level = 'info' | 'warn' | 'error';

const INGEST_URL = process.env.EXPO_PUBLIC_LOG_INGEST_URL ?? '';
const INGEST_TOKEN = process.env.EXPO_PUBLIC_LOG_INGEST_TOKEN ?? '';
export const REMOTE_LOGS_ON = INGEST_URL !== '' && INGEST_TOKEN !== '';

const FLUSH_EVERY_MS = 5_000;
const MAX_BATCH = 20;
const MAX_WAITING = 200;
let waiting: Record<string, unknown>[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function remoteLog(level: Level, message: string, context: Record<string, unknown> = {}) {
  if (__DEV__) console.log(`[${level}] ${message}`);
  if (!REMOTE_LOGS_ON) return;
  waiting.push({ dt: new Date().toISOString(), level, message, app: 'mobile', platform: Platform.OS, ...context });
  if (waiting.length > MAX_WAITING) waiting = waiting.slice(-MAX_WAITING);
  if (waiting.length >= MAX_BATCH) void flushLogs();
  else if (!timer) timer = setTimeout(() => void flushLogs(), FLUSH_EVERY_MS);
}

export async function flushLogs() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (waiting.length === 0) return;
  const batch = waiting;
  waiting = [];
  try {
    await fetch(INGEST_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${INGEST_TOKEN}` }, body: JSON.stringify(batch) });
  } catch {
    // The log service being away must never break the app; these entries are simply dropped.
  }
}

// Crashes in JavaScript are logged before the normal red screen or restart happens.
export function catchCrashes() {
  if (!REMOTE_LOGS_ON) return;
  const errorUtils = (globalThis as { ErrorUtils?: { getGlobalHandler(): (error: Error, fatal?: boolean) => void; setGlobalHandler(handler: (error: Error, fatal?: boolean) => void): void } }).ErrorUtils;
  if (!errorUtils) return;
  const previous = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, fatal) => {
    remoteLog('error', error.message, { fatal: Boolean(fatal), stack: String(error.stack ?? '').slice(0, 2000) });
    void flushLogs();
    previous(error, fatal);
  });
}
