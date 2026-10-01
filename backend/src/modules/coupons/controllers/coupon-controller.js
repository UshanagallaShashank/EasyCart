import { create_coupon, list_coupons, set_coupon_active, remove_coupon, resolve_active_coupon } from '../services/coupon-service.js';
import { AppError } from '../../../platform/shared/app-error.js';

export async function handle_create_coupon(req, res, next) {
  try {
    const coupon = await create_coupon(req.tenant_id, req.body);
    res.status(201).json({ coupon });
  } catch (err) {
    next(err);
  }
}

export async function handle_list_coupons(req, res, next) {
  try {
    const coupons = await list_coupons(req.tenant_id);
    res.status(200).json({ coupons });
  } catch (err) {
    next(err);
  }
}

export async function handle_update_coupon(req, res, next) {
  try {
    const coupon = await set_coupon_active(req.tenant_id, req.params.id, req.body);
    res.status(200).json({ coupon });
  } catch (err) {
    next(err);
  }
}

export async function handle_delete_coupon(req, res, next) {
  try {
    await remove_coupon(req.tenant_id, req.params.id);
    res.status(200).json({ message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
}

export async function handle_validate_coupon(req, res, next) {
  try {
    const code = req.body?.code;
    if (!code || typeof code !== 'string' || !code.trim()) {
      throw new AppError('Coupon code is required', 400);
    }
    const coupon = await resolve_active_coupon(req.tenant_id, code.trim());
    res.status(200).json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      }
    });
  } catch (err) {
    next(err);
  }
}

