import { randomUUID } from 'node:crypto';
import { AppError } from '../../platform/shared/app-error.js';
import { validate_customer_signup_input } from './customer-schemas.js';
import { validate_login_input } from '../auth/auth-schemas.js';
import { validate_slug } from '../../platform/shared/slug-validator.js';
import { hash_password, check_password_matches } from '../../platform/shared/hash.js';
import { sign_token } from '../../platform/shared/jwt.js';
import { find_user_by_email, save_user } from '../users/repositories/user-repository.js';
import { find_tenant_by_slug, find_tenant_by_owner_id, save_tenant } from '../tenants/repositories/tenant-repository.js';
import { save_store } from '../stores/repositories/store-repository.js';
import { clear_tenants_cache } from '../admin/services/admin-service.js';
import { build_business_address } from './store-request-address.js';
import { upload_request_document, save_request_details, read_request_details, create_signed_document_url } from '../stores/services/store-request-document-service.js';

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

export async function request_store_creation(customer_id, payload) {
  const store_name = String(payload.store_name || '').trim();
  const slug = String(payload.slug || '').trim().toLowerCase();

  if (store_name.length < 2 || store_name.length > 60) {
    throw new AppError('Store name must be between 2 and 60 characters', 400);
  }

  const slug_check = validate_slug(slug);
  if (!slug_check.valid) {
    throw new AppError(slug_check.message, 400);
  }

  const business_address = build_business_address(payload.business_address);

  const existing_slug = await find_tenant_by_slug(slug);
  if (existing_slug) {
    throw new AppError('Store slug is already taken. Please choose another.', 409);
  }

  const existing_tenant = await find_tenant_by_owner_id(customer_id);
  if (existing_tenant) {
    if (existing_tenant.status === 'pending') {
      throw new AppError('You already have a store request pending admin approval.', 400);
    }
    if (existing_tenant.status === 'active') {
      throw new AppError('You already own an active store.', 400);
    }
  }

  // Upload the documents last of the checks, so nothing is stored for a request that is going to be refused.
  const id_proof_path = await upload_request_document({ customer_id, file: payload.id_proof, kind: 'id-proof', label: 'ID proof' });
  const business_proof_path = await upload_request_document({ customer_id, file: payload.business_proof, kind: 'business-proof', label: 'Business proof' });

  const tenant = await save_tenant({
    id: randomUUID(),
    name: store_name,
    slug,
    owner_id: customer_id,
    status: 'pending'
  });

  await save_store({
    id: randomUUID(),
    tenant_id: tenant.id,
    name: store_name,
    slug,
    is_published: false,
    promotion_banner_text: null
  });

  const store_description = String(payload.store_description || payload.description || '').trim();

  await save_request_details(customer_id, { business_address, store_description, id_proof_path, business_proof_path });

  clear_tenants_cache();

  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    status: tenant.status,
    business_address,
    store_description,
    created_at: tenant.created_at
  };
}

export async function get_customer_store_request(customer_id) {
  const tenant = await find_tenant_by_owner_id(customer_id);
  if (!tenant) return null;
  const details = await read_request_details(customer_id);
  const [id_proof_url, business_proof_url] = details
    ? await Promise.all([
        create_signed_document_url(details.id_proof_path),
        create_signed_document_url(details.business_proof_path)
      ])
    : [null, null];

  const documents = [];
  if (id_proof_url && details?.id_proof_path) {
    documents.push({
      id: 'id-proof',
      title: 'ID Proof',
      file_name: details.id_proof_path.split('/').pop(),
      url: id_proof_url,
      type: details.id_proof_path.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
    });
  }
  if (business_proof_url && details?.business_proof_path) {
    documents.push({
      id: 'business-proof',
      title: 'Business Proof',
      file_name: details.business_proof_path.split('/').pop(),
      url: business_proof_url,
      type: details.business_proof_path.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
    });
  }

  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    status: tenant.status,
    created_at: tenant.created_at,
    business_address: details?.business_address ?? null,
    store_description: details?.store_description ?? details?.description ?? null,
    id_proof_url,
    business_proof_url,
    documents
  };
}
