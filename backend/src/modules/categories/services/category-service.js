// Business logic for tenant-scoped category management.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { validate_category_input } from '../category-schemas.js';
import { find_categories_by_tenant, find_category_by_id, save_category, delete_category } from '../repositories/category-repository.js';

export async function create_category(tenant_id, payload) {
  const parsed = validate_category_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
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
