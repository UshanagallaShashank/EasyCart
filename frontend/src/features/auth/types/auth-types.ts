// Types mirroring the backend auth wire format exactly.
import type { CustomerUser } from '@/features/customer-auth/types/customer-auth-types';

export interface User {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  role: 'tenant_owner' | 'platform_admin';
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// What admin sign-up returns (always a staff account, never a customer).
export interface StaffAuthResponse {
  message: string;
  user: User;
  token: string;
}

// Anyone can sign in at /api/login, so the account may be a customer, a store owner or a platform admin.
export type LoginUser = User | (CustomerUser & { role: 'customer' });

export interface LoginResponse {
  message: string;
  user: LoginUser;
  token: string;
}
