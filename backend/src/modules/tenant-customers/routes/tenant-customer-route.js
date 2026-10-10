import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../../platform/shared/resolve-tenant.js';
import { require_role } from '../../../platform/shared/require-role.js';
import { handle_list_tenant_customers, handle_get_tenant_customer } from '../controllers/tenant-customer-controller.js';

export const tenant_customer_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];

tenant_customer_router.get('/customers', owner_only, handle_list_tenant_customers);
tenant_customer_router.get('/customers/:id', owner_only, handle_get_tenant_customer);
