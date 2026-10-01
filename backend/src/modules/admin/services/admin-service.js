// Business logic for platform-admin tenant management.
import { AppError } from '../../../platform/shared/app-error.js';
import { find_all_tenants, find_tenant_by_id, update_tenant_status, update_many_tenant_statuses } from '../../tenants/repositories/tenant-repository.js';
import { find_stores_by_tenant_ids } from '../../stores/repositories/store-repository.js';
import { find_users_by_ids, update_user_role_and_tenant } from '../../users/repositories/user-repository.js';
import { orders_snapshot } from './admin-data-cache.js';
import { platform_stats_cache } from './platform-stats-service.js';

let cached_tenants = null;
let cache_timestamp = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds TTL for blazing fast subsequent loads

export function clear_tenants_cache() {
  cached_tenants = null;
  cache_timestamp = 0;
  platform_stats_cache.clear();
}

export async function list_all_tenants() {
  if (cached_tenants && Date.now() - cache_timestamp < CACHE_TTL_MS) {
    return cached_tenants;
  }

  const tenants = await find_all_tenants();
  const tenant_ids = tenants.map((tenant) => tenant.id);
  const owner_ids = tenants.map((tenant) => tenant.owner_id);

  const [stores, owners, orders] = await Promise.all([
    find_stores_by_tenant_ids(tenant_ids),
    find_users_by_ids(owner_ids),
    orders_snapshot.get()
  ]);

  const store_by_tenant_id = new Map(stores.map((store) => [store.tenant_id, store]));
  const owner_by_id = new Map(owners.map((owner) => [owner.id, owner]));

  const orders_by_tenant = new Map();
  for (const order of orders) {
    const list = orders_by_tenant.get(order.tenant_id);
    if (list) {
      list.push(order);
    } else {
      orders_by_tenant.set(order.tenant_id, [order]);
    }
  }

  const result = tenants.map((tenant) => {
    const store = store_by_tenant_id.get(tenant.id);
    const owner = owner_by_id.get(tenant.owner_id);
    const store_orders = orders_by_tenant.get(tenant.id) || [];
    const customer_count = new Set(store_orders.map((o) => o.customer_id).filter(Boolean)).size;
    const revenue = store_orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      created_at: tenant.created_at,
      is_published: store?.is_published ?? false,
      owner_email: owner?.email ?? null,
      owner_username: owner?.username ?? null,
      customer_count,
      revenue
    };
  });

  cached_tenants = result;
  cache_timestamp = Date.now();
  return result;
}

export async function suspend_tenant(tenant_id) {
  const tenant = await find_tenant_by_id(tenant_id);
  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }
  clear_tenants_cache();
  return update_tenant_status(tenant_id, 'suspended');
}

export async function reactivate_tenant(tenant_id) {
  const tenant = await find_tenant_by_id(tenant_id);
  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }
  clear_tenants_cache();
  return update_tenant_status(tenant_id, 'active');
}

export async function bulk_suspend_tenants(tenant_ids) {
  clear_tenants_cache();
  return update_many_tenant_statuses(tenant_ids, 'suspended');
}

export async function bulk_reactivate_tenants(tenant_ids) {
  clear_tenants_cache();
  return update_many_tenant_statuses(tenant_ids, 'active');
}

export async function list_store_requests() {
  const all_tenants = await find_all_tenants();
  const requests = all_tenants.filter((t) => t.status === 'pending' || t.status === 'rejected');
  const owner_ids = requests.map((t) => t.owner_id);
  const tenant_ids = requests.map((t) => t.id);

  const [owners, stores] = await Promise.all([
    find_users_by_ids(owner_ids),
    find_stores_by_tenant_ids(tenant_ids)
  ]);

  const owner_by_id = new Map(owners.map((u) => [u.id, u]));
  const store_by_tenant = new Map(stores.map((s) => [s.tenant_id, s]));

  return requests.map((t) => {
    const owner = owner_by_id.get(t.owner_id);
    const store = store_by_tenant.get(t.id);
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      status: t.status,
      created_at: t.created_at,
      description: store?.promotion_banner_text ?? null,
      customer: owner
        ? {
            id: owner.id,
            username: owner.username,
            email: owner.email,
            phone_number: owner.phone_number
          }
        : null
    };
  });
}

export async function approve_store_request(tenant_id) {
  const tenant = await find_tenant_by_id(tenant_id);
  if (!tenant) throw new AppError('Tenant request not found', 404);
  if (tenant.status === 'active') throw new AppError('Store is already active', 400);

  await update_tenant_status(tenant_id, 'active');
  await update_user_role_and_tenant(tenant.owner_id, 'tenant_owner', tenant.id);
  clear_tenants_cache();
  return { success: true, message: `Store "${tenant.name}" approved successfully` };
}

export async function reject_store_request(tenant_id) {
  const tenant = await find_tenant_by_id(tenant_id);
  if (!tenant) throw new AppError('Tenant request not found', 404);

  await update_tenant_status(tenant_id, 'rejected');
  clear_tenants_cache();
  return { success: true, message: `Store "${tenant.name}" request rejected` };
}
