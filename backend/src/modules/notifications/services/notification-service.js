// Business logic for tenant-scoped, in-app notifications.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import {
  find_notifications_by_tenant,
  find_notification_by_id,
  save_notification,
  mark_notification_read
} from '../repositories/notification-repository.js';

export async function list_notifications(tenant_id) {
  return find_notifications_by_tenant(tenant_id);
}

export async function read_notification(tenant_id, id) {
  const notification = await find_notification_by_id(id, tenant_id);
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  return mark_notification_read(id, tenant_id);
}

export async function notify_order_placed(tenant_id, order) {
  return save_notification({
    id: randomUUID(),
    tenant_id,
    type: 'order_placed',
    message: `New order placed — total $${order.total.toFixed(2)}`,
    is_read: false
  });
}

export async function notify_cart_abandoned(tenant_id, customer_username) {
  return save_notification({
    id: randomUUID(),
    tenant_id,
    type: 'cart_abandoned',
    message: `${customer_username} hasn't ordered recently`,
    is_read: false
  });
}
