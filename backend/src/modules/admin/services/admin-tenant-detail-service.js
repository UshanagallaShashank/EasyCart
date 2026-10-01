// Gathers everything a platform admin sees about one store: tenant, storefront, owner, and activity.
import { AppError } from '../../../platform/shared/app-error.js';
import { find_tenant_by_id } from '../../tenants/repositories/tenant-repository.js';
import { find_store_by_tenant_id } from '../../stores/repositories/store-repository.js';
import { find_user_by_id } from '../../users/repositories/user-repository.js';
import { find_products_by_tenant } from '../../products/repositories/product-repository.js';
import { find_orders_by_tenant } from '../../orders/repositories/order-query-repository.js';
import { summarize_tenant_activity } from './summarize-tenant-activity.js';

export async function get_tenant_detail(tenant_id) {
  const tenant = await find_tenant_by_id(tenant_id);
  if (!tenant) throw new AppError('Tenant not found', 404);
  const [store, owner, products, orders] = await Promise.all([find_store_by_tenant_id(tenant.id), find_user_by_id(tenant.owner_id), find_products_by_tenant(tenant.id), find_orders_by_tenant(tenant.id)]);
  return {
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, status: tenant.status, created_at: tenant.created_at },
    store: store ? { name: store.name, logo_url: store.logo_url ?? null, banner_url: store.banner_url ?? null, is_published: Boolean(store.is_published), delivery_fee: store.delivery_fee ?? 0, promotion_banner_text: store.promotion_banner_text ?? null } : null,
    owner: owner ? { username: owner.username, email: owner.email, phone_number: owner.phone_number } : null,
    activity: summarize_tenant_activity(products ?? [], orders ?? [])
  };
}
