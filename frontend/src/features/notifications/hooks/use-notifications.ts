import { useQuery } from '@tanstack/react-query';
import { listNotifications } from '../api/notification-api';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await listNotifications()).notifications,
    refetchInterval: 30000
  });
}
