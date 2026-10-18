import { BACKUP_REFRESH_MS } from '@/lib/query-client';
import { useQuery } from '@tanstack/react-query';
import { getMyOrder } from '../api/customer-order-api';

export function useMyOrder(id: string) {
  return useQuery({
    queryKey: ['my-orders', id],
    queryFn: async () => (await getMyOrder(id)).order,
    // Keep the page up to date while the order is still open, so a new rider or status shows without reloading.
    refetchInterval: (query) => (['fulfilled', 'cancelled'].includes(query.state.data?.status ?? '') ? false : BACKUP_REFRESH_MS)
  });
}
