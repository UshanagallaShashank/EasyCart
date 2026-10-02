// Live updates from the server (the same stream the website uses): when an order, rider or settlement changes,
// the screens that show it refresh by themselves. Reconnects with a fresh ticket after a drop.
import { useEffect } from 'react';
import EventSource from 'react-native-sse';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api, apiUrl } from './api';

type Topic = 'order' | 'rider' | 'settlement';

// Every key starts with its area, so refreshing ['orders'] refreshes every order screen.
const KEYS: Record<Topic, QueryKey[]> = {
  order: [['orders'], ['my-orders'], ['rider'], ['store-deliveries'], ['store-settlements'], ['admin'], ['products']],
  rider: [['rider'], ['admin']],
  settlement: [['rider'], ['store-settlements'], ['admin']]
};

export function useLiveUpdates(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    let source: EventSource | null = null;
    let stopped = false;
    let retryMs = 1000;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let batchTimer: ReturnType<typeof setTimeout> | undefined;
    const pending = new Set<Topic>();

    function flush() {
      for (const topic of pending) for (const key of KEYS[topic]) queryClient.invalidateQueries({ queryKey: key });
      pending.clear();
    }

    function scheduleReconnect() {
      if (stopped) return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => connect(true), retryMs);
      retryMs = Math.min(retryMs * 2, 30_000);
    }

    async function connect(isReconnect: boolean) {
      try {
        const { ticket } = await api<{ ticket: string }>('/live/ticket', { method: 'POST' });
        if (stopped) return;
        source = new EventSource(apiUrl(`/live?ticket=${encodeURIComponent(ticket)}`), { pollingInterval: 0 });
        source.addEventListener('open', () => {
          retryMs = 1000;
          if (isReconnect) {
            (Object.keys(KEYS) as Topic[]).forEach((topic) => pending.add(topic));
            flush();
          }
        });
        source.addEventListener('message', (event) => {
          try {
            const { topic } = JSON.parse(event.data ?? '{}') as { topic: Topic };
            if (!(topic in KEYS)) return;
            pending.add(topic);
            clearTimeout(batchTimer);
            batchTimer = setTimeout(flush, 400);
          } catch {
            // Not one of our messages.
          }
        });
        source.addEventListener('error', () => {
          source?.close();
          scheduleReconnect();
        });
      } catch {
        scheduleReconnect();
      }
    }

    connect(false);
    return () => {
      stopped = true;
      source?.removeAllEventListeners();
      source?.close();
      clearTimeout(retryTimer);
      clearTimeout(batchTimer);
    };
  }, [enabled, queryClient]);
}
