import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead } from '../api/admin-api';

export function useAdminNotifications() {
  return useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => listAdminNotifications(),
    refetchInterval: 15_000 // Poll every 15s for new store requests and platform alerts
  });
}

export function useMarkAdminNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAdminNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    }
  });
}

export function useMarkAllAdminNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => markAllAdminNotificationsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    }
  });
}
