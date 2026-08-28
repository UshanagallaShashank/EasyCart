import { randomUUID } from 'node:crypto';
import { AppError } from '../../platform/shared/app-error.js';
import { validate_signup_input, validate_login_input } from './auth-schemas.js';
import { validate_slug } from '../../platform/shared/slug-validator.js';
import { hash_password, check_password_matches } from '../../platform/shared/hash.js';
import { sign_token } from '../../platform/shared/jwt.js';
import { find_user_by_email, save_user, set_user_tenant_id } from '../users/repositories/user-repository.js';
import { find_tenant_by_slug, save_tenant } from '../tenants/repositories/tenant-repository.js';
import { create_store_for_tenant } from '../stores/services/store-service.js';

export async function create_user(payload) {
  const parsed = validate_signup_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }

  const email = String(payload.email).toLowerCase();
  const existing_user = await find_user_by_email(email);
  if (existing_user) {
    throw new AppError('User already exists', 409);
  }

  const slug_check = validate_slug(payload.slug);
  if (!slug_check.valid) {
    throw new AppError(slug_check.message, 400);
  }
  const existing_tenant = await find_tenant_by_slug(payload.slug);
  if (existing_tenant) {
    throw new AppError('Slug already taken', 409);
  }

  const password_hash = await hash_password(payload.password);
  const user = {
    id: randomUUID(),
    username: String(payload.username).trim(),
    email,
    phone_number: String(payload.phone_number).trim(),
    password_hash,
    role: 'tenant_owner',
    tenant_id: null
  };
  const saved_user = await save_user(user);

  const tenant = await save_tenant({ id: randomUUID(), name: payload.store_name, slug: payload.slug, owner_id: saved_user.id, status: 'active' });
  await create_store_for_tenant(tenant.id, payload.store_name, payload.slug);
  await set_user_tenant_id(saved_user.id, tenant.id);

  const token = sign_token({ sub: saved_user.id, email: saved_user.email, username: saved_user.username, role: saved_user.role, tenant_id: tenant.id });

  return {
    user: {
      id: saved_user.id,
      username: saved_user.username,
      email: saved_user.email,
      phone_number: saved_user.phone_number
    },
    tenant,
    token
  };
}

export async function login_user(payload) {
  const parsed = validate_login_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }

  const email = String(payload.email).toLowerCase();
  const user = await find_user_by_email(email);
  const password_matches = user ? await check_password_matches(payload.password, user.password_hash) : false;
  if (!user || !password_matches) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = sign_token({ sub: user.id, email: user.email, username: user.username, role: user.role, tenant_id: user.tenant_id });

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
