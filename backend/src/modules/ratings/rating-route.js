import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../platform/shared/resolve-tenant.js';
import { require_role } from '../../platform/shared/require-role.js';
import { require_any_role } from '../../platform/shared/require-any-role.js';
import { handle_get_my_order_rating, handle_rate_my_order, handle_ratings_summary } from './rating-controller.js';

export const rating_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];
const customer_only = [authenticate, require_any_role('customer')];

rating_router.get('/my-orders/:id/rating', ...customer_only, handle_get_my_order_rating);
rating_router.post('/my-orders/:id/rating', ...customer_only, handle_rate_my_order);
rating_router.get('/ratings/summary', ...owner_only, handle_ratings_summary);
