import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { require_any_role } from '../../platform/shared/require-any-role.js';
import { resolve_public_tenant } from '../../platform/shared/resolve-public-tenant.js';
import { handle_list_favourites, handle_add_favourite, handle_remove_favourite } from './favourite-controller.js';

export const favourite_router = Router();

const customer_only = [authenticate, require_any_role('customer')];

favourite_router.get('/stores/:slug/favourites', resolve_public_tenant, ...customer_only, handle_list_favourites);
favourite_router.put('/stores/:slug/favourites/:product_id', resolve_public_tenant, ...customer_only, handle_add_favourite);
favourite_router.delete('/stores/:slug/favourites/:product_id', resolve_public_tenant, ...customer_only, handle_remove_favourite);
