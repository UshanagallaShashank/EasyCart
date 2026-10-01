import { apiRequest } from '@/shared/api/api-client';
import type { AdminTenant, AdminTenantDetail, PlatformStats, PlatformUser, StoreRequest, AdminNotification } from '../types/admin-types';

export function listTenants(): Promise<{ tenants: AdminTenant[] }> {
  return apiRequest('/admin/tenants');
}

export function listStoreRequests(): Promise<{ requests: StoreRequest[] }> {
  return apiRequest('/admin/store-requests');
}

export function approveStoreRequest(id: string): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/admin/store-requests/${id}/approve`, { method: 'POST' });
}

export function rejectStoreRequest(id: string): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/admin/store-requests/${id}/reject`, { method: 'POST' });
}

export function suspendTenant(id: string): Promise<{ tenant: AdminTenant }> {
  return apiRequest(`/admin/tenants/${id}/suspend`, { method: 'POST' });
}

export function reactivateTenant(id: string): Promise<{ tenant: AdminTenant }> {
  return apiRequest(`/admin/tenants/${id}/reactivate`, { method: 'POST' });
}

export function bulkSuspendTenants(ids: string[]): Promise<{ success: boolean; count: number }> {
  return apiRequest('/admin/tenants/bulk-suspend', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
}

export function bulkReactivateTenants(ids: string[]): Promise<{ success: boolean; count: number }> {
  return apiRequest('/admin/tenants/bulk-reactivate', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
}

export function getTenantDetail(id: string): Promise<AdminTenantDetail> {
  return apiRequest(`/admin/tenants/${id}`);
}

export function getPlatformStats(): Promise<PlatformStats> {
  return apiRequest('/admin/stats');
}

export function listPlatformUsers(): Promise<{ users: PlatformUser[] }> {
  return apiRequest('/admin/users');
}

export function listAdminNotifications(): Promise<{ notifications: AdminNotification[]; unread_count: number }> {
  return apiRequest('/admin/notifications');
}

export function markAdminNotificationRead(id: string): Promise<{ success: boolean; id: string }> {
  return apiRequest(`/admin/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllAdminNotificationsRead(ids: string[]): Promise<{ success: boolean; count: number }> {
  return apiRequest('/admin/notifications/mark-all-read', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
}
