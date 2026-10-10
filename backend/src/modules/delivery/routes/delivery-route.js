import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { require_role } from '../../../platform/shared/require-role.js';
import { require_any_role } from '../../../platform/shared/require-any-role.js';
import { resolve_tenant } from '../../../platform/shared/resolve-tenant.js';
import { sensitive_route_limiter } from '../../../platform/shared/rate-limit.js';
import * as c from '../controllers/delivery-controllers.js';

export const delivery_router = Router();

const rider_only = [authenticate, require_role('delivery_partner')];
const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];
const customer_only = [authenticate, require_any_role('customer')];
const admin_only = [authenticate, require_role('platform_admin')];

// Rider account and application
delivery_router.post('/riders/register', sensitive_route_limiter, c.handle_rider_register);
delivery_router.get('/riders/me', rider_only, c.handle_get_my_rider);
delivery_router.patch('/riders/me', rider_only, c.handle_update_my_profile);
delivery_router.put('/riders/me/base-location', rider_only, c.handle_set_my_base_location);
delivery_router.post('/riders/me/documents', rider_only, c.handle_upload_my_document);
delivery_router.delete('/riders/me/documents/other/:index', rider_only, c.handle_remove_my_other_document);
delivery_router.post('/riders/me/submit', rider_only, c.handle_submit_my_application);

// Rider on the road
delivery_router.put('/riders/me/online', rider_only, c.handle_set_my_online);
delivery_router.put('/riders/me/location', rider_only, c.handle_update_my_location);
delivery_router.get('/riders/me/home', rider_only, c.handle_get_rider_home);
delivery_router.get('/riders/me/history', rider_only, c.handle_list_rider_history);
delivery_router.get('/riders/me/earnings', rider_only, c.handle_get_rider_earnings);
delivery_router.get('/riders/me/settlements', rider_only, c.handle_rider_list_settlements);
delivery_router.get('/riders/me/orders/:id', rider_only, c.handle_get_rider_order);
delivery_router.post('/riders/me/orders/:id/accept', rider_only, c.handle_accept_offer);
delivery_router.post('/riders/me/orders/:id/decline', rider_only, c.handle_decline_offer);
delivery_router.post('/riders/me/orders/:id/pickup', rider_only, sensitive_route_limiter, c.handle_confirm_pickup);
delivery_router.post('/riders/me/orders/:id/deliver', rider_only, sensitive_route_limiter, c.handle_complete_delivery);
delivery_router.post('/riders/me/orders/:id/pay-store', rider_only, sensitive_route_limiter, c.handle_rider_pay_store);

// Store owner
delivery_router.get('/delivery/riders-nearby', owner_only, c.handle_list_riders_near_store);
delivery_router.get('/delivery/orders', owner_only, c.handle_list_store_deliveries);
delivery_router.get('/delivery/settlements', owner_only, c.handle_store_list_settlements);
delivery_router.get('/orders/:id/delivery', owner_only, c.handle_get_store_order_delivery);
delivery_router.post('/orders/:id/delivery/settle', owner_only, sensitive_route_limiter, c.handle_store_settle_order);
delivery_router.post('/orders/:id/delivery/request-rider', owner_only, c.handle_request_rider);
delivery_router.post('/orders/:id/delivery/cancel-rider', owner_only, c.handle_cancel_rider_request);
delivery_router.post('/orders/:id/delivery/new-pickup-code', owner_only, c.handle_reissue_pickup_code);
delivery_router.post('/orders/:id/delivery/new-delivery-code', owner_only, c.handle_reissue_delivery_code);

// Customer
delivery_router.get('/my-orders/:id/delivery', customer_only, c.handle_get_customer_order_delivery);

// Platform admin
delivery_router.get('/admin/riders', admin_only, c.handle_admin_list_riders);
delivery_router.get('/admin/riders/:id', admin_only, c.handle_admin_get_rider);
delivery_router.post('/admin/riders/:id/approve', admin_only, c.handle_admin_approve_rider);
delivery_router.post('/admin/riders/:id/reject', admin_only, c.handle_admin_reject_rider);
delivery_router.post('/admin/riders/:id/suspend', admin_only, c.handle_admin_suspend_rider);
delivery_router.post('/admin/riders/:id/reactivate', admin_only, c.handle_admin_reactivate_rider);
delivery_router.post('/admin/riders/:id/settlements', admin_only, c.handle_admin_record_settlement);
delivery_router.get('/admin/deliveries', admin_only, c.handle_admin_list_deliveries);
