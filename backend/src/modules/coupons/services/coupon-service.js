// Business logic for tenant-scoped coupon management.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import { validate_coupon_input, validate_coupon_update_input } from '../coupon-schemas.js';
import {
  find_coupons_by_tenant,
  find_coupon_by_id,
  find_coupon_by_code,
  save_coupon,
  update_coupon,
  delete_coupon
} from '../repositories/coupon-repository.js';

async function assert_code_available(tenant_id, code) {
  const existing = await find_coupon_by_code(code, tenant_id);
  if (existing) {
    throw new AppError('Coupon code already in use', 409);
  }
}

export async function create_coupon(tenant_id, payload) {
  const parsed = validate_coupon_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  await assert_code_available(tenant_id, parsed.data.code);
  return save_coupon({ id: randomUUID(), tenant_id, is_active: true, ...parsed.data });
}

export async function list_coupons(tenant_id) {
  return find_coupons_by_tenant(tenant_id);
}

export async function set_coupon_active(tenant_id, id, payload) {
  const parsed = validate_coupon_update_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  const coupon = await find_coupon_by_id(id, tenant_id);
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  return update_coupon(id, tenant_id, parsed.data);
}

export async function remove_coupon(tenant_id, id) {
  const coupon = await find_coupon_by_id(id, tenant_id);
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  await delete_coupon(id, tenant_id);
}

export async function resolve_active_coupon(tenant_id, code) {
  const coupon = await find_coupon_by_code(String(code).trim().toUpperCase(), tenant_id);
  if (!coupon || !coupon.is_active) {
    throw new AppError('Invalid or inactive coupon code', 400);
  }
  return coupon;
}

export function apply_coupon_discount(subtotal, coupon) {
  if (coupon.discount_type === 'percent') {
    return Math.min(subtotal, (subtotal * coupon.discount_value) / 100);
  }
  return Math.min(subtotal, coupon.discount_value);
}
