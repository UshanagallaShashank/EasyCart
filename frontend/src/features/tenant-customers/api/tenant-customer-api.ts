import { apiRequest } from '@/shared/api/api-client';
import type { TenantCustomerSummary, TenantCustomerDetail } from '../types/tenant-customer-types';

export function listTenantCustomers(): Promise<{ customers: TenantCustomerSummary[] }> {
  return apiRequest('/customers');
}

export function getTenantCustomer(id: string): Promise<{ customer: TenantCustomerDetail }> {
  return apiRequest(`/customers/${id}`);
}
