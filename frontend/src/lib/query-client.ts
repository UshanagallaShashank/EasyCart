// Single shared TanStack Query client instance; data stays fresh for a minute to avoid refetching on every visit.
// Screens update live through server events (shared/live); refetching when the tab regains focus covers a laptop
// that was asleep, and the slow backup refresh covers a dropped live connection.
import { QueryClient } from '@tanstack/react-query';

export const BACKUP_REFRESH_MS = 60_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000, refetchOnWindowFocus: true },
    mutations: { retry: 0 }
  }
});
