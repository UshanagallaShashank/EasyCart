// Makes detail pages open at once: if the item is already in a list on the phone, show it straight away
// while the full version loads quietly in the background. No spinner for something we already have.
import type { QueryClient, QueryKey } from '@tanstack/react-query';

// Looks through every cached list under `listKey` for an item with this id.
export function findInCachedLists<T extends { id: string }>(queryClient: QueryClient, listKey: QueryKey, id: string): T | undefined {
  for (const [, data] of queryClient.getQueriesData<unknown>({ queryKey: listKey })) {
    if (!Array.isArray(data)) continue;
    const found = (data as T[]).find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
}
