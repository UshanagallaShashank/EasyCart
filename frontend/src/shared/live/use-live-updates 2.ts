// Keeps open screens up to date without a page reload.
// Opens one Server-Sent Events stream per signed-in area; when the server says "an order changed",
// the matching cached queries are refreshed (only the ones on screen actually refetch).
// Reconnects with a fresh ticket after a drop, and refreshes everything once on reconnect in case something was missed.
import { useEffect } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { apiRequest, apiUrl, type AuthType } from '@/shared/api/api-client';
import { KEYS_BY_TOPIC, type LiveTopic } from './live-topics';

const BATCH_MS = 400;
const MAX_RETRY_MS = 30_000;

export function useLiveUpdates(authType: AuthType, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    let source: EventSource | null = null;
    let stopped = false;
    let retryMs = 1000;
    let retryTimer: number | undefined;
    let batchTimer: number | undefined;
    const pending = new Set<LiveTopic>();

    // Several changes in quick succession (accept, then pickup) become one refresh.
    function flush() {
      const keys = new Map<string, QueryKey>();
      for (const topic of pending) for (const key of KEYS_BY_TOPIC[topic]) keys.set(JSON.stringify(key), key);
      pending.clear();
      for (const key of keys.values()) queryClient.invalidateQueries({ queryKey: key });
    }

    function onMessage(event: MessageEvent) {
      try {
        const { topic } = JSON.parse(event.data) as { topic: LiveTopic };
        if (!(topic in KEYS_BY_TOPIC)) return;
        pending.add(topic);
        window.clearTimeout(batchTimer);
        batchTimer = window.setTimeout(flush, BATCH_MS);
      } catch {
        // Ignore anything that is not one of our messages.
      }
    }

    async function connect(isReconnect: boolean) {
      try {
        const { ticket } = await apiRequest<{ ticket: string }>('/live/ticket', { method: 'POST' }, authType);
        if (stopped) return;
        source = new EventSource(apiUrl(`/live?ticket=${encodeURIComponent(ticket)}`));
        source.onmessage = onMessage;
        source.onopen = () => {
          retryMs = 1000;
          if (isReconnect) {
            (Object.keys(KEYS_BY_TOPIC) as LiveTopic[]).forEach((topic) => pending.add(topic));
            flush();
          }
        };
        // Tickets expire after a minute, so a dropped stream always reconnects with a fresh one.
        source.onerror = () => {
          source?.close();
          scheduleReconnect();
        };
      } catch {
        scheduleReconnect();
      }
    }

    function scheduleReconnect() {
      if (stopped) return;
      window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(() => connect(true), retryMs);
      retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
    }

    connect(false);
    return () => {
      stopped = true;
      source?.close();
      window.clearTimeout(retryTimer);
      window.clearTimeout(batchTimer);
    };
  }, [authType, enabled, queryClient]);
}
