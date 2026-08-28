// Business logic for tenant-scoped product and inventory management.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { validate_product_input, validate_product_update_input } from '../product-schemas.js';
import { find_category_by_id } from '../../categories/repositories/category-repository.js';
import {
  find_products_by_tenant,
  find_product_by_id,
  find_product_by_sku,
  find_active_products_by_tenant,
  find_active_product_by_id,
  save_product,
  update_product,
  delete_product
} from '../repositories/product-repository.js';

async function assert_category_ownership(tenant_id, category_id) {
  if (!category_id) return;
  const category = await find_category_by_id(category_id, tenant_id);
  if (!category) {
    throw new AppError('Category not found', 400);
  }
}

async function assert_sku_available(tenant_id, sku) {
  const existing = await find_product_by_sku(sku, tenant_id);
  if (existing) {
    throw new AppError('SKU already in use', 409);
  }
}

export async function create_product(tenant_id, payload) {
  const parsed = validate_product_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  await assert_category_ownership(tenant_id, parsed.data.category_id);
  await assert_sku_available(tenant_id, parsed.data.sku);
  return save_product({ id: randomUUID(), tenant_id, ...parsed.data });
}

export async function list_products(tenant_id) {
  return find_products_by_tenant(tenant_id);
}

export async function get_product(tenant_id, id) {
  const product = await find_product_by_id(id, tenant_id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

export async function update_product_details(tenant_id, id, payload) {
  const parsed = validate_product_update_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  await get_product(tenant_id, id);
  await assert_category_ownership(tenant_id, parsed.data.category_id);
  if (parsed.data.sku) {
    await assert_sku_available(tenant_id, parsed.data.sku);
  }
  return update_product(id, tenant_id, parsed.data);
}

export async function remove_product(tenant_id, id) {
  await get_product(tenant_id, id);
  await delete_product(id, tenant_id);
}

export async function search_public_products(tenant_id, { search, category_id } = {}) {
  return find_active_products_by_tenant(tenant_id, { search, category_id });
}

export async function get_public_product(tenant_id, id) {
  const product = await find_active_product_by_id(id, tenant_id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

export async function adjust_stock(tenant_id, id, delta) {
  const product = await get_product(tenant_id, id);
  const new_quantity = product.stock_quantity + delta;
  if (new_quantity < 0) {
    throw new AppError('Stock cannot go negative', 400);
  }
  const updated = await update_product(id, tenant_id, { stock_quantity: new_quantity });
  return { product: updated, low_stock: new_quantity <= product.low_stock_threshold };
}
