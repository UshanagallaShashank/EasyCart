import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../../platform/shared/resolve-tenant.js';
import { require_role } from '../../../platform/shared/require-role.js';
import { handle_create_category, handle_list_categories, handle_delete_category } from '../controllers/category-controller.js';

export const category_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];

category_router.post('/categories', owner_only, handle_create_category);
category_router.get('/categories', owner_only, handle_list_categories);
category_router.delete('/categories/:id', owner_only, handle_delete_category);
