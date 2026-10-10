// Types mirroring the backend customer auth wire format exactly.
export interface CustomerUser {
  id: string;
  username: string;
  email: string;
  phone_number: string;
}

export interface CustomerRegisterPayload {
  username: string;
  email: string;
  password: string;
  phone_number: string;
}

export interface CustomerLoginPayload {
  email: string;
  password: string;
}

export interface CustomerRegisterResponse {
  message: string;
  user: CustomerUser;
  token: string;
}

export interface CustomerLoginResponse {
  message: string;
  user: CustomerUser;
  token: string;
}
