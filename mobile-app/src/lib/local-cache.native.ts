// Phones can keep the data cache in an on-device SQLite database, so screens open instantly and still show the last
// data while offline. Off by default: set EXPO_PUBLIC_OFFLINE_CACHE=true to switch it on. The web build uses local-cache.ts.
import Storage from 'expo-sqlite/kv-store';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Persister } from '@tanstack/react-query-persist-client';

export const OFFLINE_CACHE_ON = process.env.EXPO_PUBLIC_OFFLINE_CACHE === 'true';

export function createLocalCache(): Persister | null {
  if (!OFFLINE_CACHE_ON) return null;
  return createAsyncStoragePersister({ storage: Storage, key: 'easycart-cache', throttleTime: 2_000 });
}
