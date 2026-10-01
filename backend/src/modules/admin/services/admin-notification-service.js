// Service for generating and managing platform-admin notifications.
import { find_all_tenants } from '../../tenants/repositories/tenant-repository.js';
import { find_users_by_ids } from '../../users/repositories/user-repository.js';

// Track read notification IDs in-memory for this server session.
const read_admin_notification_ids = new Set();

export async function list_admin_notifications() {
  const tenants = await find_all_tenants();

  const owner_ids = tenants
    .map((t) => t.owner_id)
    .filter(Boolean);

  const owners = await find_users_by_ids(owner_ids);
  const owner_by_id = new Map(owners.map((u) => [u.id, u]));

  const notifications = [];

  // 1. Pending store requests (high priority)
  const pending_tenants = tenants.filter((t) => t.status === 'pending');
  for (const tenant of pending_tenants) {
    const owner = owner_by_id.get(tenant.owner_id);
    const id = `pending-store-${tenant.id}`;
    notifications.push({
      id,
      type: 'store_request',
      title: 'Store Request Pending',
      message: `"${tenant.name}" requested by ${owner?.username || 'customer'} is waiting for admin approval.`,
      link: `/admin/stores/${tenant.id}`,
      priority: 'high',
      is_read: read_admin_notification_ids.has(id),
      created_at: tenant.created_at
    });
  }

  // 2. Suspended stores (up to 5 most recent)
  const suspended_tenants = tenants
    .filter((t) => t.status === 'suspended')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  for (const tenant of suspended_tenants) {
    const owner = owner_by_id.get(tenant.owner_id);
    const id = `suspended-store-${tenant.id}`;
    notifications.push({
      id,
      type: 'store_suspended',
      title: 'Store Suspended',
      message: `"${tenant.name}" owned by ${owner?.username || 'user'} is currently suspended.`,
      link: `/admin/stores/${tenant.id}`,
      priority: 'medium',
      is_read: read_admin_notification_ids.has(id),
      created_at: tenant.created_at
    });
  }

  // 3. Recently active stores (up to 5 most recent)
  const recent_active = tenants
    .filter((t) => t.status === 'active')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  for (const tenant of recent_active) {
    const owner = owner_by_id.get(tenant.owner_id);
    const id = `active-store-${tenant.id}`;
    notifications.push({
      id,
      type: 'store_active',
      title: 'Store Active',
      message: `"${tenant.name}" owned by ${owner?.username || 'user'} is live on EasyCart.`,
      link: `/admin/stores/${tenant.id}`,
      priority: 'low',
      is_read: read_admin_notification_ids.has(id),
      created_at: tenant.created_at
    });
  }

  // Sort: unread first, then newest date first
  notifications.sort((a, b) => {
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const unread_count = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unread_count
  };
}

export function mark_admin_notification_read(notification_id) {
  read_admin_notification_ids.add(notification_id);
  return { success: true, id: notification_id };
}

export function mark_all_admin_notifications_read(notification_ids = []) {
  for (const id of notification_ids) {
    read_admin_notification_ids.add(id);
  }
  return { success: true, count: notification_ids.length };
}
