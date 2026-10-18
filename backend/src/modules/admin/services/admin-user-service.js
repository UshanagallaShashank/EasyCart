// Every user account for platform admins (no password hashes), with the store name for owners, newest first.
import { find_all_tenants, find_tenant_by_id } from '../../tenants/repositories/tenant-repository.js';
import { find_all_users_public } from '../../users/repositories/user-list-repository.js';
import {
  find_user_by_id,
  update_user_fields,
  count_platform_admins
} from '../../users/repositories/user-repository.js';
import { find_orders_by_customer, find_orders_by_tenant } from '../../orders/repositories/order-query-repository.js';
import { AppError } from '../../../platform/shared/app-error.js';

export async function list_platform_users() {
  const [users, tenants] = await Promise.all([find_all_users_public(), find_all_tenants()]);
  const tenant_by_id = new Map(tenants.map((t) => [t.id, t]));
  return users
    .map((u) => {
      const tenant = u.tenant_id ? tenant_by_id.get(u.tenant_id) : null;
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        phone_number: u.phone_number ?? '',
        role: u.role,
        status: u.status ?? 'active',
        last_active_at: u.last_active_at ?? u.created_at,
        tenant_id: u.tenant_id ?? null,
        created_at: u.created_at,
        store: tenant ? { id: tenant.id, name: tenant.name, slug: tenant.slug, status: tenant.status } : null
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function get_platform_user(userId) {
  const user = await find_user_by_id(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  let store = null;
  if (user.tenant_id) {
    const tenant = await find_tenant_by_id(user.tenant_id);
    if (tenant) {
      store = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        created_at: tenant.created_at
      };
    }
  }

  let orders_count = 0;
  let total_spent = 0;
  let recent_orders = [];

  try {
    if (user.role === 'customer') {
      const orders = (await find_orders_by_customer(user.id)) || [];
      orders_count = orders.length;
      total_spent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      recent_orders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((o) => ({
          id: o.id,
          total: o.total,
          status: o.status,
          payment_status: o.payment_status,
          created_at: o.created_at
        }));
    } else if (user.role === 'tenant_owner' && user.tenant_id) {
      const orders = (await find_orders_by_tenant(user.tenant_id)) || [];
      orders_count = orders.length;
      total_spent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      recent_orders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((o) => ({
          id: o.id,
          total: o.total,
          status: o.status,
          payment_status: o.payment_status,
          created_at: o.created_at
        }));
    }
  } catch (err) {
    console.error('Error fetching user order stats:', err);
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone_number: user.phone_number ?? '',
    role: user.role,
    status: user.status ?? 'active',
    last_active_at: user.last_active_at ?? user.created_at,
    tenant_id: user.tenant_id ?? null,
    created_at: user.created_at,
    store,
    orders_count,
    total_spent,
    recent_orders
  };
}

export async function update_platform_user(userId, updates, currentAdminId) {
  const existing = await find_user_by_id(userId);
  if (!existing) {
    throw new AppError('User not found', 404);
  }

  // Admins cannot change user personal details (username, email, phone)
  if (
    updates.username !== undefined ||
    updates.email !== undefined ||
    updates.phone_number !== undefined
  ) {
    throw new AppError(
      'Admins cannot modify personal user details (username, email, phone). Users manage their own profile details.',
      400
    );
  }

  const payload = {};

  // Status management (active / inactive)
  if (updates.status !== undefined) {
    const valid_statuses = ['active', 'inactive'];
    if (!valid_statuses.includes(updates.status)) {
      throw new AppError(`Invalid status. Must be one of: ${valid_statuses.join(', ')}`, 400);
    }

    if (userId === currentAdminId && updates.status === 'inactive') {
      throw new AppError('You cannot deactivate your own admin account.', 400);
    }

    if (existing.role === 'platform_admin' && updates.status === 'inactive') {
      const admin_count = await count_platform_admins();
      if (admin_count <= 1) {
        throw new AppError('Cannot deactivate the only remaining platform admin.', 400);
      }
    }

    payload.status = updates.status;
  }

  // Role management
  if (updates.role !== undefined) {
    const valid_roles = ['platform_admin', 'tenant_owner', 'customer'];
    if (!valid_roles.includes(updates.role)) {
      throw new AppError(`Invalid role. Must be one of: ${valid_roles.join(', ')}`, 400);
    }

    if (existing.role === 'platform_admin' && updates.role !== 'platform_admin') {
      const admin_count = await count_platform_admins();
      if (admin_count <= 1) {
        throw new AppError('Cannot demote the only remaining platform admin.', 400);
      }
    }

    payload.role = updates.role;
    if (updates.role === 'customer') {
      payload.tenant_id = null;
    }
  }

  if (updates.tenant_id !== undefined) {
    payload.tenant_id = updates.tenant_id;
  }

  const updated = await update_user_fields(userId, payload);

  let store = null;
  if (updated.tenant_id) {
    const tenant = await find_tenant_by_id(updated.tenant_id);
    if (tenant) {
      store = { id: tenant.id, name: tenant.name, slug: tenant.slug, status: tenant.status };
    }
  }

  return {
    id: updated.id,
    username: updated.username,
    email: updated.email,
    phone_number: updated.phone_number ?? '',
    role: updated.role,
    status: updated.status ?? 'active',
    last_active_at: updated.last_active_at ?? updated.created_at,
    tenant_id: updated.tenant_id ?? null,
    created_at: updated.created_at,
    store
  };
}
