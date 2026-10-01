import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { require_role } from '../../../platform/shared/require-role.js';
import { handle_get_platform_stats, handle_list_platform_users } from '../controllers/admin-insights-controller.js';
import { handle_list_tenants, handle_suspend_tenant, handle_reactivate_tenant, handle_get_tenant_detail } from '../controllers/admin-controller.js';

export const admin_router = Router();

const admin_only = [authenticate, require_role('platform_admin')];

admin_router.get('/admin/stats', admin_only, handle_get_platform_stats);
admin_router.get('/admin/users', admin_only, handle_list_platform_users);
admin_router.get('/admin/tenants', admin_only, handle_list_tenants);
admin_router.get('/admin/tenants/:id', admin_only, handle_get_tenant_detail);
admin_router.post('/admin/tenants/:id/suspend', admin_only, handle_suspend_tenant);
admin_router.post('/admin/tenants/:id/reactivate', admin_only, handle_reactivate_tenant);
