import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../../platform/shared/resolve-tenant.js';
import { require_role } from '../../../platform/shared/require-role.js';
import {
  handle_update_store_settings,
  handle_publish_store,
  handle_unpublish_store,
  handle_get_public_store
} from '../controllers/store-controller.js';

export const store_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];

store_router.patch('/stores/me', owner_only, handle_update_store_settings);
store_router.post('/stores/me/publish', owner_only, handle_publish_store);
store_router.post('/stores/me/unpublish', owner_only, handle_unpublish_store);
store_router.get('/stores/:slug', handle_get_public_store);
