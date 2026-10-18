import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../../platform/shared/resolve-tenant.js';
import { resolve_public_tenant } from '../../../platform/shared/resolve-public-tenant.js';
import { require_role } from '../../../platform/shared/require-role.js';
import {
  handle_create_coupon,
  handle_list_coupons,
  handle_update_coupon,
  handle_delete_coupon,
  handle_validate_coupon
} from '../controllers/coupon-controller.js';

export const coupon_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];

coupon_router.post('/stores/:slug/coupons/validate', resolve_public_tenant, handle_validate_coupon);

coupon_router.post('/coupons', owner_only, handle_create_coupon);
coupon_router.get('/coupons', owner_only, handle_list_coupons);
coupon_router.patch('/coupons/:id', owner_only, handle_update_coupon);
coupon_router.delete('/coupons/:id', owner_only, handle_delete_coupon);

