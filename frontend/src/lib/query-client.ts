// Single shared TanStack Query client instance; data stays fresh for a minute to avoid refetching on every visit.
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000, refetchOnWindowFocus: false },
    mutations: { retry: 0 }
  }
});
