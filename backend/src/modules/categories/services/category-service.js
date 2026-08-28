// Business logic for tenant-scoped category management.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { validate_category_input } from '../category-schemas.js';
import { find_categories_by_tenant, find_category_by_id, find_category_by_name, save_category, delete_category } from '../repositories/category-repository.js';

async function assert_category_name_available(tenant_id, name) {
  const existing = await find_category_by_name(name, tenant_id);
  if (existing) {
    throw new AppError('Category name already in use', 409);
  }
}

export async function create_category(tenant_id, payload) {
  const parsed = validate_category_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  await assert_category_name_available(tenant_id, parsed.data.name);
  return save_category({ id: randomUUID(), tenant_id, name: parsed.data.name });
}

export async function list_categories(tenant_id) {
  return find_categories_by_tenant(tenant_id);
}

export async function remove_category(tenant_id, id) {
  const category = await find_category_by_id(id, tenant_id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  await delete_category(id, tenant_id);
}
