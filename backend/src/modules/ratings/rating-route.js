import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../platform/shared/resolve-tenant.js';
import { require_role } from '../../platform/shared/require-role.js';
import { require_any_role } from '../../platform/shared/require-any-role.js';
import { handle_get_my_order_rating, handle_rate_my_order, handle_ratings_summary, handle_store_reviews, handle_product_ratings } from './rating-controller.js';
import { resolve_public_tenant } from '../../platform/shared/resolve-public-tenant.js';

export const rating_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];
const customer_only = [authenticate, require_any_role('customer')];

rating_router.get('/my-orders/:id/rating', ...customer_only, handle_get_my_order_rating);
rating_router.post('/my-orders/:id/rating', ...customer_only, handle_rate_my_order);
rating_router.get('/ratings/summary', ...owner_only, handle_ratings_summary);
// Public: what shoppers see about a store and its products.
rating_router.get('/stores/:slug/reviews', resolve_public_tenant, handle_store_reviews);
rating_router.get('/stores/:slug/product-ratings', resolve_public_tenant, handle_product_ratings);
