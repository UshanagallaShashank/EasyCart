import { apiRequest } from '@/shared/api/api-client';
import type { CustomerRegisterPayload, CustomerLoginPayload, CustomerRegisterResponse, CustomerLoginResponse } from '../types/customer-auth-types';

export function registerCustomer(payload: CustomerRegisterPayload): Promise<CustomerRegisterResponse> {
  return apiRequest('/customers/register', { method: 'POST', body: JSON.stringify(payload) }, 'customer');
}

export function loginCustomer(payload: CustomerLoginPayload): Promise<CustomerLoginResponse> {
  return apiRequest('/customers/login', { method: 'POST', body: JSON.stringify(payload) }, 'customer');
}
