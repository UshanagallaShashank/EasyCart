import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { require_role } from '../../../platform/shared/require-role.js';
import { handle_get_platform_stats, handle_list_platform_users } from '../controllers/admin-insights-controller.js';
import {
  handle_list_tenants,
  handle_suspend_tenant,
  handle_reactivate_tenant,
  handle_bulk_suspend_tenants,
  handle_bulk_reactivate_tenants,
  handle_list_store_requests,
  handle_approve_store_request,
  handle_reject_store_request,
  handle_get_tenant_detail,
  handle_get_store_categories,
  handle_add_store_category,
  handle_remove_store_category,
  handle_list_admin_notifications,
  handle_read_admin_notification,
  handle_mark_all_admin_notifications_read
} from '../controllers/admin-controller.js';

export const admin_router = Router();

const admin_only = [authenticate, require_role('platform_admin')];

// Public / applicant category retrieval
admin_router.get('/store-categories', handle_get_store_categories);

// Admin category management
admin_router.get('/admin/store-categories', admin_only, handle_get_store_categories);
admin_router.post('/admin/store-categories', admin_only, handle_add_store_category);
admin_router.delete('/admin/store-categories/:name', admin_only, handle_remove_store_category);

admin_router.get('/admin/stats', admin_only, handle_get_platform_stats);
admin_router.get('/admin/users', admin_only, handle_list_platform_users);
admin_router.get('/admin/tenants', admin_only, handle_list_tenants);
admin_router.get('/admin/store-requests', admin_only, handle_list_store_requests);
admin_router.post('/admin/store-requests/:id/approve', admin_only, handle_approve_store_request);
admin_router.post('/admin/store-requests/:id/reject', admin_only, handle_reject_store_request);
admin_router.get('/admin/tenants/:id', admin_only, handle_get_tenant_detail);
admin_router.post('/admin/tenants/bulk-suspend', admin_only, handle_bulk_suspend_tenants);
admin_router.post('/admin/tenants/bulk-reactivate', admin_only, handle_bulk_reactivate_tenants);
admin_router.post('/admin/tenants/:id/suspend', admin_only, handle_suspend_tenant);
admin_router.post('/admin/tenants/:id/reactivate', admin_only, handle_reactivate_tenant);
admin_router.get('/admin/notifications', admin_only, handle_list_admin_notifications);
admin_router.patch('/admin/notifications/:id/read', admin_only, handle_read_admin_notification);
admin_router.post('/admin/notifications/mark-all-read', admin_only, handle_mark_all_admin_notifications_read);
