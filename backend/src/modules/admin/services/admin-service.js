// Business logic for platform-admin tenant management.
import { AppError } from '../../../platform/shared/app-error.js';
import { find_all_tenants, find_tenant_by_id, update_tenant_status } from '../../tenants/repositories/tenant-repository.js';
import { find_stores_by_tenant_ids } from '../../stores/repositories/store-repository.js';
import { find_users_by_ids } from '../../users/repositories/user-repository.js';

export async function list_all_tenants() {
  const tenants = await find_all_tenants();
  const tenant_ids = tenants.map((tenant) => tenant.id);
  const owner_ids = tenants.map((tenant) => tenant.owner_id);

  const [stores, owners] = await Promise.all([find_stores_by_tenant_ids(tenant_ids), find_users_by_ids(owner_ids)]);
  const store_by_tenant_id = new Map(stores.map((store) => [store.tenant_id, store]));
  const owner_by_id = new Map(owners.map((owner) => [owner.id, owner]));

  return tenants.map((tenant) => {
    const store = store_by_tenant_id.get(tenant.id);
    const owner = owner_by_id.get(tenant.owner_id);
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      created_at: tenant.created_at,
      is_published: store?.is_published ?? false,
      owner_email: owner?.email ?? null,
      owner_username: owner?.username ?? null
    };
  });
}

export async function suspend_tenant(tenant_id) {
  const tenant = await find_tenant_by_id(tenant_id);
  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }
  return update_tenant_status(tenant_id, 'suspended');
}

export async function reactivate_tenant(tenant_id) {
  const tenant = await find_tenant_by_id(tenant_id);
  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }
  return update_tenant_status(tenant_id, 'active');
}
