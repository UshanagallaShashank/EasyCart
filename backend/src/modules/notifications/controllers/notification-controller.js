import { list_notifications, read_notification } from '../services/notification-service.js';

export async function handle_list_notifications(req, res, next) {
  try {
    const notifications = await list_notifications(req.tenant_id);
    res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
}

export async function handle_read_notification(req, res, next) {
  try {
    const notification = await read_notification(req.tenant_id, req.params.id);
    res.status(200).json({ notification });
  } catch (err) {
    next(err);
  }
}
