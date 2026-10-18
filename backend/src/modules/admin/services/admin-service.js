// Business logic for platform-admin tenant management.
import { AppError } from '../../../platform/shared/app-error.js';
import { find_all_tenants, find_tenant_by_id, update_tenant_status, update_many_tenant_statuses } from '../../tenants/repositories/tenant-repository.js';
import { find_stores_by_tenant_ids, update_store } from '../../stores/repositories/store-repository.js';
import { find_users_by_ids, update_user_role_and_tenant } from '../../users/repositories/user-repository.js';
import { orders_snapshot } from './admin-data-cache.js';
import { platform_stats_cache } from './platform-stats-service.js';
import { create_signed_document_url, read_request_details } from '../../stores/services/store-request-document-service.js';

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

  const owners = await find_users_by_ids(owner_ids);
  const owner_by_id = new Map(owners.map((u) => [u.id, u]));

  // Private documents are shown to the admin through links that expire after an hour.
  const details_list = await Promise.all(requests.map((t) => read_request_details(t.owner_id)));
  const id_proof_urls = await Promise.all(details_list.map((details) => create_signed_document_url(details?.id_proof_path)));
  const business_proof_urls = await Promise.all(details_list.map((details) => create_signed_document_url(details?.business_proof_path)));

  return requests.map((t, index) => {
    const owner = owner_by_id.get(t.owner_id);
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      status: t.status,
      created_at: t.created_at,
      business_address: details_list[index]?.business_address ?? null,
      store_description: details_list[index]?.store_description ?? details_list[index]?.description ?? null,
      id_proof_url: id_proof_urls[index],
      business_proof_url: business_proof_urls[index],
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

  try {
    const details = await read_request_details(tenant.owner_id);
    if (details?.business_address) {
      const pin = details.business_address.match(/\b\d{6}\b/)?.[0] || null;
      await update_store(tenant_id, {
        address: details.business_address,
        business_address: details.business_address,
        ...(pin ? { pincode: pin } : {})
      });
    }
  } catch (err) {
    console.error('Failed to copy business address on store approval:', err);
  }

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
