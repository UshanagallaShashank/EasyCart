import { randomUUID } from 'node:crypto';
import { AppError } from '../../platform/shared/app-error.js';
import { validate_customer_signup_input } from './customer-schemas.js';
import { validate_login_input } from '../auth/auth-schemas.js';
import { hash_password, check_password_matches } from '../../platform/shared/hash.js';
import { sign_token } from '../../platform/shared/jwt.js';
import { find_user_by_email, save_user } from '../users/repositories/user-repository.js';

export async function register_customer(payload) {
  const parsed = validate_customer_signup_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }

  const email = String(payload.email).toLowerCase();
  const existing_user = await find_user_by_email(email);
  if (existing_user) {
    throw new AppError('User already exists', 409);
  }

  const password_hash = await hash_password(payload.password);
  const saved_user = await save_user({
    id: randomUUID(),
    username: String(payload.username).trim(),
    email,
    phone_number: String(payload.phone_number).trim(),
    password_hash,
    role: 'customer',
    tenant_id: null
  });

  const token = sign_token({ sub: saved_user.id, email: saved_user.email, username: saved_user.username, role: saved_user.role, tenant_id: null });

  return {
    user: {
      id: saved_user.id,
      username: saved_user.username,
      email: saved_user.email,
      phone_number: saved_user.phone_number
    },
    token
  };
}

export async function login_customer(payload) {
  const parsed = validate_login_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }

  const email = String(payload.email).toLowerCase();
  const user = await find_user_by_email(email);
  const password_matches = user ? await check_password_matches(payload.password, user.password_hash) : false;
  if (!user || !password_matches || user.role !== 'customer') {
    throw new AppError('Invalid email or password', 401);
  }

  const token = sign_token({ sub: user.id, email: user.email, username: user.username, role: user.role, tenant_id: null });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number
    },
    token
  };
}
