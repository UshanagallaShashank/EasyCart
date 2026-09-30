import { apiRequest } from '@/shared/api/api-client';
import type { AdminTenant } from '../types/admin-types';

export function listTenants(): Promise<{ tenants: AdminTenant[] }> {
  return apiRequest('/admin/tenants');
}

export function suspendTenant(id: string): Promise<{ tenant: AdminTenant }> {
  return apiRequest(`/admin/tenants/${id}/suspend`, { method: 'POST' });
}

export function reactivateTenant(id: string): Promise<{ tenant: AdminTenant }> {
  return apiRequest(`/admin/tenants/${id}/reactivate`, { method: 'POST' });
}
