import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead } from '../api/admin-api';
import type { AdminNotification } from '../types/admin-types';

interface NotificationsData {
  notifications: AdminNotification[];
  unread_count: number;
}

export function useAdminNotifications() {
  return useQuery<NotificationsData>({
    queryKey: ['admin', 'notifications'],
    queryFn: () => listAdminNotifications(),
    refetchInterval: 15_000 // Poll every 15s for new store requests and platform alerts
  });
}

export function useMarkAdminNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAdminNotificationRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'notifications'] });
      const previous = queryClient.getQueryData<NotificationsData>(['admin', 'notifications']);
      if (previous) {
        queryClient.setQueryData<NotificationsData>(['admin', 'notifications'], {
          ...previous,
          notifications: previous.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
          unread_count: Math.max(0, previous.unread_count - 1)
        });
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin', 'notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    }
  });
}

export function useMarkAllAdminNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => markAllAdminNotificationsRead(ids),
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'notifications'] });
      const previous = queryClient.getQueryData<NotificationsData>(['admin', 'notifications']);
      if (previous) {
        const idSet = new Set(ids);
        queryClient.setQueryData<NotificationsData>(['admin', 'notifications'], {
          ...previous,
          notifications: previous.notifications.map((n) =>
            ids.length === 0 || idSet.has(n.id) ? { ...n, is_read: true } : n
          ),
          unread_count: 0
        });
      }
      return { previous };
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin', 'notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    }
  });
}
