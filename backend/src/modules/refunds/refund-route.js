import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../platform/shared/resolve-tenant.js';
import { require_role } from '../../platform/shared/require-role.js';
import { require_any_role } from '../../platform/shared/require-any-role.js';
import { sensitive_route_limiter } from '../../platform/shared/rate-limit.js';
import {
  handle_admin_refunds,
  handle_decide_refund,
  handle_my_refunds,
  handle_order_refunds,
  handle_refund_cancelled_order,
  handle_request_refund,
  handle_store_refunds
} from './refund-controller.js';

export const refund_router = Router();

const customer_only = [authenticate, require_any_role('customer')];
const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];

refund_router.post('/my-orders/:id/refunds', sensitive_route_limiter, ...customer_only, handle_request_refund);
refund_router.get('/my-orders/:id/refunds', ...customer_only, handle_order_refunds);
refund_router.get('/my-refunds', ...customer_only, handle_my_refunds);

refund_router.get('/refunds', ...owner_only, handle_store_refunds);
refund_router.post('/refunds/:id/decision', sensitive_route_limiter, ...owner_only, handle_decide_refund);
refund_router.post('/orders/:id/refund', sensitive_route_limiter, ...owner_only, handle_refund_cancelled_order);

refund_router.get('/admin/refunds', authenticate, require_role('platform_admin'), handle_admin_refunds);
