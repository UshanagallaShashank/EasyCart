// Live updates from the server (the same stream the website uses): when an order, rider or settlement changes,
// the screens that show it refresh by themselves. Reconnects with a fresh ticket after a drop.
import { useEffect } from 'react';
import EventSource from 'react-native-sse';
import { useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query';
import { api, apiUrl } from './api';

type Topic = 'order' | 'rider' | 'settlement' | 'refund';

// Every key starts with its area, so refreshing ['orders'] refreshes every order screen.
const KEYS: Record<Topic, QueryKey[]> = {
  order: [['orders'], ['my-orders'], ['rider'], ['store-deliveries'], ['store-settlements'], ['admin'], ['products']],
  rider: [['rider'], ['admin']],
  settlement: [['rider'], ['store-settlements'], ['admin']],
  refund: [['refunds'], ['my-orders'], ['admin']]
};

// How long to wait before asking the server to confirm. Short, because the screen has already been updated.
const CONFIRM_DELAY_MS = 150;

// The small change that came with the message goes straight into the saved screens, so the order status,
// payment and rider offer change at once, with no network wait. The server confirms a moment later.
function applyOrderPatch(queryClient: QueryClient, id: string, patch: Record<string, unknown>) {
  const patchOne = (order: unknown) => {
    const row = order as { id?: string } | undefined;
    return row && row.id === id ? { ...row, ...patch } : order;
  };
  const patchList = (list: unknown) => (Array.isArray(list) ? list.map(patchOne) : list);

  queryClient.setQueryData(['my-orders'], patchList);
  queryClient.setQueryData(['my-orders', id], patchOne);
  queryClient.setQueryData(['orders'], patchList);
  queryClient.setQueryData(['orders', id], patchOne);
}

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
            const { topic, id, patch } = JSON.parse(event.data ?? '{}') as { topic: Topic; id?: string; patch?: Record<string, unknown> };
            if (!(topic in KEYS)) return;
            if (topic === 'order' && id && patch) applyOrderPatch(queryClient, id, patch);
            pending.add(topic);
            clearTimeout(batchTimer);
            batchTimer = setTimeout(flush, CONFIRM_DELAY_MS);
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
