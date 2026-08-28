// Types mirroring the backend auth wire format exactly.
export interface User {
  id: string;
  username: string;
  email: string;
  phone_number: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  phone_number: string;
  store_name: string;
  slug: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  tenant: Tenant;
  token: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}
