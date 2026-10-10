import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../../platform/shared/resolve-tenant.js';
import { require_role } from '../../../platform/shared/require-role.js';
import { handle_list_notifications, handle_read_notification } from '../controllers/notification-controller.js';

export const notification_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];

notification_router.get('/notifications', owner_only, handle_list_notifications);
notification_router.patch('/notifications/:id/read', owner_only, handle_read_notification);
