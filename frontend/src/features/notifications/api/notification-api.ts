import { apiRequest } from '@/shared/api/api-client';
import type { Notification } from '../types/notification-types';

export function listNotifications(): Promise<{ notifications: Notification[] }> {
  return apiRequest('/notifications');
}

export function markNotificationRead(id: string): Promise<{ notification: Notification }> {
  return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}
