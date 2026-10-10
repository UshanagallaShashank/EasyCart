import { Router } from 'express';
import { authenticate } from '../../../platform/shared/authenticate.js';
import { resolve_tenant } from '../../../platform/shared/resolve-tenant.js';
import { require_role } from '../../../platform/shared/require-role.js';
import { resolve_public_tenant } from '../../../platform/shared/resolve-public-tenant.js';
import {
  handle_create_product,
  handle_list_products,
  handle_get_product,
  handle_update_product,
  handle_delete_product
} from '../controllers/product-controller.js';
import { handle_adjust_stock } from '../controllers/inventory-controller.js';
import { handle_search_public_products, handle_get_public_product } from '../controllers/public-product-controller.js';

export const product_router = Router();

const owner_only = [authenticate, resolve_tenant, require_role('tenant_owner')];

product_router.post('/products', owner_only, handle_create_product);
product_router.get('/products', owner_only, handle_list_products);
product_router.get('/products/:id', owner_only, handle_get_product);
product_router.patch('/products/:id', owner_only, handle_update_product);
product_router.delete('/products/:id', owner_only, handle_delete_product);
product_router.post('/products/:id/adjust-stock', owner_only, handle_adjust_stock);

product_router.get('/stores/:slug/products', resolve_public_tenant, handle_search_public_products);
product_router.get('/stores/:slug/products/:id', resolve_public_tenant, handle_get_public_product);
