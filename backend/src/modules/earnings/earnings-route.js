import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../platform/shared/resolve-tenant.js';
import { require_role } from '../../platform/shared/require-role.js';
import { handle_owner_earnings, handle_platform_earnings } from './earnings-controller.js';

export const earnings_router = Router();

earnings_router.get('/earnings', authenticate, resolve_tenant, require_role('tenant_owner'), handle_owner_earnings);
earnings_router.get('/admin/earnings', authenticate, require_role('platform_admin'), handle_platform_earnings);
