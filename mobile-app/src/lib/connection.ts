// Remembers whether the server is answering, since when it is not, and the last few outages.
// The API client reports every call; the banner and the status page read it.
import { useSyncExternalStore } from 'react';

export interface Outage {
  startedAt: number;
  endedAt: number;
}

export interface ConnectionState {
  downSince: number | null;
  lastOutage: Outage | null;
  outages: Outage[];
}

const MAX_OUTAGES = 20;
let state: ConnectionState = { downSince: null, lastOutage: null, outages: [] };
const listeners = new Set<() => void>();

function setState(next: ConnectionState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function reportServerUnreachable() {
  if (state.downSince !== null) return;
  setState({ ...state, downSince: Date.now() });
}

export function reportServerReachable() {
  if (state.downSince === null) return;
  const outage = { startedAt: state.downSince, endedAt: Date.now() };
  setState({ downSince: null, lastOutage: outage, outages: [outage, ...state.outages].slice(0, MAX_OUTAGES) });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useConnection(): ConnectionState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

// 75 seconds becomes "1:15"; an hour or more becomes "1:02:05".
export function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, '0');
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`;
  return `${minutes}:${seconds}`;
}
