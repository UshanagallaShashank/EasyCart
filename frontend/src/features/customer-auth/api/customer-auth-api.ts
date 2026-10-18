import { apiRequest } from '@/shared/api/api-client';
import type { CustomerRegisterPayload, CustomerRegisterResponse } from '../types/customer-auth-types';

export function registerCustomer(payload: CustomerRegisterPayload): Promise<CustomerRegisterResponse> {
  return apiRequest('/customers/register', { method: 'POST', body: JSON.stringify(payload) }, 'customer');
}
