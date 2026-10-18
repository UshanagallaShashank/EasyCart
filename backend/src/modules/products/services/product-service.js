// Business logic for tenant-scoped product and inventory management.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { validate_product_input, validate_product_update_input } from '../product-schemas.js';
import { find_category_by_id } from '../../categories/repositories/category-repository.js';
import { plan_stock_change } from '../../orders/lib/order-rules.js';
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

async function assert_sku_available(tenant_id, sku, exclude_id = null) {
  const existing = await find_product_by_sku(sku, tenant_id);
  if (existing && existing.id !== exclude_id) {
    throw new AppError('SKU already in use', 409);
  }
}

export async function create_product(tenant_id, payload) {
  const data = { ...payload };
  if (!data.sku?.trim()) {
    data.sku = `SKU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
  const parsed = validate_product_input(data);
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
    await assert_sku_available(tenant_id, parsed.data.sku, id);
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

function group_by_product(lines) {
  const groups = new Map();
  for (const line of lines) {
    if (!groups.has(line.product_id)) groups.set(line.product_id, []);
    groups.get(line.product_id).push(line);
  }
  return groups;
}

// Takes (sign -1) or returns (sign +1) stock for every line of an order, including sizes/colours.
// All or nothing: if any product is short, the ones already changed are put back before the error is raised.
export async function change_order_stock(tenant_id, lines, sign) {
  const done = [];
  try {
    for (const [product_id, product_lines] of group_by_product(lines)) {
      const product = await find_product_by_id(product_id, tenant_id);
      if (!product) {
        // Returning stock for a product the store has since deleted: nothing to put back.
        if (sign > 0) continue;
        throw new AppError('A product in your cart is no longer available', 400);
      }
      const plan = plan_stock_change(product, product_lines, sign);
      if (plan.problem) throw new AppError(plan.problem, 400);
      await update_product(product_id, tenant_id, { stock_quantity: plan.stock_quantity, variants: plan.variants });
      done.push(product_lines);
    }
  } catch (err) {
    for (const product_lines of done) {
      await change_order_stock(tenant_id, product_lines, -sign).catch(() => undefined);
    }
    throw err;
  }
}
