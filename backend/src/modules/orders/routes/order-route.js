import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../../platform/shared/resolve-tenant.js';
import { require_role } from '../../../platform/shared/require-role.js';
import { require_any_role } from '../../../platform/shared/require-any-role.js';
import { resolve_public_tenant } from '../../../platform/shared/resolve-public-tenant.js';
import { sensitive_route_limiter } from '../../../platform/shared/rate-limit.js';
import { handle_checkout } from '../controllers/checkout-controller.js';
import {
  handle_list_orders,
  handle_get_order,
  handle_update_order_status,
  handle_update_payment_status,
  handle_update_fulfillment_status,
  handle_update_assignment
} from '../controllers/order-controller.js';
import { handle_list_my_orders, handle_get_my_order, handle_cancel_my_order, handle_list_my_stores } from '../controllers/customer-order-controller.js';

export const order_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];
const customer_only = [authenticate, require_any_role('customer')];

order_router.post('/stores/:slug/checkout', sensitive_route_limiter, resolve_public_tenant, ...customer_only, handle_checkout);

order_router.get('/orders', owner_only, handle_list_orders);
order_router.get('/orders/:id', owner_only, handle_get_order);
order_router.patch('/orders/:id/status', owner_only, handle_update_order_status);
order_router.patch('/orders/:id/payment-status', owner_only, handle_update_payment_status);
order_router.patch('/orders/:id/fulfillment-status', owner_only, handle_update_fulfillment_status);
order_router.patch('/orders/:id/assignment', owner_only, handle_update_assignment);

order_router.get('/my-stores', customer_only, handle_list_my_stores);
order_router.get('/my-orders', customer_only, handle_list_my_orders);
order_router.get('/my-orders/:id', customer_only, handle_get_my_order);
order_router.patch('/my-orders/:id/cancel', customer_only, handle_cancel_my_order);
