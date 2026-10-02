// Service for generating and managing platform-admin notifications.
import { find_all_tenants } from '../../tenants/repositories/tenant-repository.js';
import { find_users_by_ids } from '../../users/repositories/user-repository.js';
import { find_riders_by_status } from '../../delivery/repositories/rider-repository.js';

// Delivery partner applications waiting for review. Empty if the riders table is not set up yet.
async function find_pending_riders() {
  try {
    return await find_riders_by_status('pending');
  } catch (err) {
    console.warn('Could not read delivery partner applications:', err?.message || err);
    return [];
  }
}

// Track read notification IDs in-memory for this server session.
const read_admin_notification_ids = new Set();

export async function list_admin_notifications() {
  const tenants = await find_all_tenants();

  const owner_ids = tenants
    .filter((t) => t.status === 'pending' || t.status === 'suspended')
    .map((t) => t.owner_id)
    .filter(Boolean);

  const owners = await find_users_by_ids(owner_ids);
  const owner_by_id = new Map(owners.map((u) => [u.id, u]));

  const notifications = [];

  // 1. Pending store requests (high priority, needs admin review)
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

  // 2. Suspended stores (needs admin review or reactivation)
  const suspended_tenants = tenants
    .filter((t) => t.status === 'suspended')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

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

  // 3. Delivery partner applications (needs admin review before the rider can take orders)
  for (const rider of await find_pending_riders()) {
    const id = `pending-rider-${rider.id}-${rider.submitted_at ?? ''}`;
    notifications.push({
      id,
      type: 'rider_request',
      title: 'Delivery Partner Application',
      message: `${rider.full_name}${rider.city ? ` from ${rider.city}` : ''} applied to deliver and is waiting for document review.`,
      link: `/admin/riders/${rider.id}`,
      priority: 'high',
      is_read: read_admin_notification_ids.has(id),
      created_at: rider.submitted_at ?? rider.created_at
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

export async function mark_all_admin_notifications_read(notification_ids = []) {
  if (Array.isArray(notification_ids) && notification_ids.length > 0) {
    for (const id of notification_ids) {
      read_admin_notification_ids.add(id);
    }
    return { success: true, count: notification_ids.length };
  }

  // If no IDs specified, mark all currently existing notifications as read
  const { notifications } = await list_admin_notifications();
  for (const n of notifications) {
    read_admin_notification_ids.add(n.id);
  }
  return { success: true, count: notifications.length };
}
