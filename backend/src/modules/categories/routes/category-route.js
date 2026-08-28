import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../../platform/shared/resolve-tenant.js';
import { require_role } from '../../../platform/shared/require-role.js';
import { resolve_public_tenant } from '../../../platform/shared/resolve-public-tenant.js';
import { handle_create_category, handle_list_categories, handle_delete_category } from '../controllers/category-controller.js';
import { handle_list_public_categories } from '../controllers/public-category-controller.js';

export const category_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];

category_router.post('/categories', owner_only, handle_create_category);
category_router.get('/categories', owner_only, handle_list_categories);
category_router.delete('/categories/:id', owner_only, handle_delete_category);

category_router.get('/stores/:slug/categories', resolve_public_tenant, handle_list_public_categories);
