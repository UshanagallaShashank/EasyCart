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

export function enrich_coupon_status(coupon) {
  if (!coupon) return coupon;
  const is_expired = Boolean(coupon.expires_at && new Date(coupon.expires_at) < new Date());
  const effective_active = is_expired ? false : Boolean(coupon.is_active);
  const status = is_expired ? 'expired' : (effective_active ? 'active' : 'inactive');

  return {
    ...coupon,
    expires_at: coupon.expires_at ?? null,
    is_active: effective_active,
    is_expired,
    status
  };
}

export async function create_coupon(tenant_id, payload) {
  const parsed = validate_coupon_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  await assert_code_available(tenant_id, parsed.data.code);

  const expires_at = parsed.data.expires_at ? new Date(parsed.data.expires_at).toISOString() : null;
  const is_expired = Boolean(expires_at && new Date(expires_at) < new Date());
  const is_active = is_expired ? false : true;

  const saved = await save_coupon({
    id: randomUUID(),
    tenant_id,
    ...parsed.data,
    expires_at,
    is_active
  });
  return enrich_coupon_status(saved);
}

export async function list_coupons(tenant_id) {
  const coupons = await find_coupons_by_tenant(tenant_id);
  // Auto-sync database row if active coupon expired
  for (const c of coupons) {
    if (c.expires_at && new Date(c.expires_at) < new Date() && c.is_active) {
      update_coupon(c.id, tenant_id, { is_active: false }).catch(() => {});
    }
  }
  return coupons.map(enrich_coupon_status);
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
  if (parsed.data.is_active && coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw new AppError('Cannot activate an expired coupon. Please extend the expiration date first.', 400);
  }
  const updated = await update_coupon(id, tenant_id, parsed.data);
  return enrich_coupon_status(updated);
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
  if (!coupon) {
    throw new AppError('Invalid or inactive coupon code', 400);
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    if (coupon.is_active) {
      update_coupon(coupon.id, tenant_id, { is_active: false }).catch(() => {});
    }
    throw new AppError('Coupon has expired', 400);
  }
  if (!coupon.is_active) {
    throw new AppError('Invalid or inactive coupon code', 400);
  }
  return enrich_coupon_status(coupon);
}

export function apply_coupon_discount(subtotal, coupon) {
  if (coupon.discount_type === 'percent') {
    return Math.min(subtotal, (subtotal * coupon.discount_value) / 100);
  }
  return Math.min(subtotal, coupon.discount_value);
}
