// The web build keeps no offline copy of the data (phones can, see local-cache.native.ts).
import type { Persister } from '@tanstack/react-query-persist-client';

export const OFFLINE_CACHE_ON = false;

export function createLocalCache(): Persister | null {
  return null;
}
