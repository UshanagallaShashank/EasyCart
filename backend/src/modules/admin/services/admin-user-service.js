// Every user account for platform admins (no password hashes), with the store name for owners, newest first.
import { find_all_tenants } from '../../tenants/repositories/tenant-repository.js';
import { find_all_users_public } from '../../users/repositories/user-list-repository.js';

export async function list_platform_users() {
  const [users, tenants] = await Promise.all([find_all_users_public(), find_all_tenants()]);
  const tenant_by_id = new Map(tenants.map((t) => [t.id, t]));
  return users
    .map((u) => {
      const tenant = u.tenant_id ? tenant_by_id.get(u.tenant_id) : null;
      return { id: u.id, username: u.username, email: u.email, phone_number: u.phone_number, role: u.role, created_at: u.created_at, store: tenant ? { id: tenant.id, name: tenant.name, slug: tenant.slug } : null };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
