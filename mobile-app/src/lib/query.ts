// Shared data cache. Screens refresh live (lib/live), when the app comes back to the foreground,
// and every minute as a backup.
import { AppState, Platform } from 'react-native';
import { QueryClient, focusManager } from '@tanstack/react-query';

export const BACKUP_REFRESH_MS = 60_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchInterval: BACKUP_REFRESH_MS },
    mutations: { retry: 0 }
  }
});

// On phones, "window focus" means the app returning to the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => focusManager.setFocused(state === 'active'));
}
