// Business logic for store settings, publishing, and public lookup.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { validate_store_settings_input } from '../store-schemas.js';
import { find_store_by_tenant_id, find_store_by_slug, save_store, update_store } from '../repositories/store-repository.js';

export async function create_store_for_tenant(tenant_id, name, slug) {
  return save_store({ id: randomUUID(), tenant_id, name, slug, is_published: false });
}

export async function update_store_settings(tenant_id, payload) {
  const parsed = validate_store_settings_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  const store = await find_store_by_tenant_id(tenant_id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  return update_store(tenant_id, parsed.data);
}

export async function set_store_published(tenant_id, is_published) {
  const store = await find_store_by_tenant_id(tenant_id);
  if (!store) {
    throw new AppError('Store not found', 404);
  }
  return update_store(tenant_id, { is_published });
}

export async function get_public_store_by_slug(slug) {
  const store = await find_store_by_slug(slug);
  if (!store || !store.is_published) {
    throw new AppError('Store not found', 404);
  }
  return { name: store.name, slug: store.slug, logo_url: store.logo_url, banner_url: store.banner_url, theme: store.theme };
}
