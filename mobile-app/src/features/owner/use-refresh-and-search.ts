// Pull-to-refresh on the store's order screens. Every order still waiting for a rider is first sent to all
// nearby riders again (riders who passed on it too), then the screen reloads.
import { useState } from 'react';
import { useToast } from '@/components/toast';
import { api, errorMessage } from '@/lib/api';

export function useRefreshAndSearch(reload: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  async function refresh() {
    setRefreshing(true);
    try {
      const { sent } = await api<{ sent: number }>('/delivery/search-riders', { method: 'POST' });
      if (sent === 1) toast('1 waiting order sent to nearby riders again', 'success');
      if (sent > 1) toast(`${sent} waiting orders sent to nearby riders again`, 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      await reload();
      setRefreshing(false);
    }
  }

  return { refresh: () => void refresh(), refreshing };
}
