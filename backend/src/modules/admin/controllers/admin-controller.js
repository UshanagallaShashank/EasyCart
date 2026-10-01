import {
  list_all_tenants,
  suspend_tenant,
  reactivate_tenant,
  bulk_suspend_tenants,
  bulk_reactivate_tenants,
  list_store_requests,
  approve_store_request,
  reject_store_request
} from '../services/admin-service.js';
import { get_tenant_detail } from '../services/admin-tenant-detail-service.js';
import {
  list_admin_notifications,
  mark_admin_notification_read,
  mark_all_admin_notifications_read
} from '../services/admin-notification-service.js';

export async function handle_list_tenants(req, res, next) {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const all = await list_all_tenants();

    if (page && limit && page > 0 && limit > 0) {
      const offset = (page - 1) * limit;
      const paged = all.slice(offset, offset + limit);
      return res.status(200).json({
        tenants: paged,
        total: all.length,
        page,
        limit,
        total_pages: Math.ceil(all.length / limit)
      });
    }

    res.status(200).json({ tenants: all, total: all.length });
  } catch (err) {
    next(err);
  }
}

export async function handle_bulk_suspend_tenants(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ message: 'ids array is required' });
    }
    const result = await bulk_suspend_tenants(ids);
    res.status(200).json({ success: true, count: result.length });
  } catch (err) {
    next(err);
  }
}

export async function handle_bulk_reactivate_tenants(req, res, next) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ message: 'ids array is required' });
    }
    const result = await bulk_reactivate_tenants(ids);
    res.status(200).json({ success: true, count: result.length });
  } catch (err) {
    next(err);
  }
}

export async function handle_suspend_tenant(req, res, next) {
  try {
    const tenant = await suspend_tenant(req.params.id);
    res.status(200).json({ tenant });
  } catch (err) {
    next(err);
  }
}

export async function handle_reactivate_tenant(req, res, next) {
  try {
    const tenant = await reactivate_tenant(req.params.id);
    res.status(200).json({ tenant });
  } catch (err) {
    next(err);
  }
}

export async function handle_get_tenant_detail(req, res, next) {
  try {
    const detail = await get_tenant_detail(req.params.id);
    res.status(200).json(detail);
  } catch (err) {
    next(err);
  }
}

export async function handle_list_store_requests(req, res, next) {
  try {
    const requests = await list_store_requests();
    res.status(200).json({ requests });
  } catch (err) {
    next(err);
  }
}

export async function handle_approve_store_request(req, res, next) {
  try {
    const result = await approve_store_request(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handle_reject_store_request(req, res, next) {
  try {
    const result = await reject_store_request(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handle_list_admin_notifications(req, res, next) {
  try {
    const data = await list_admin_notifications();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function handle_read_admin_notification(req, res, next) {
  try {
    const result = mark_admin_notification_read(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handle_mark_all_admin_notifications_read(req, res, next) {
  try {
    const { ids } = req.body || {};
    const result = mark_all_admin_notifications_read(ids || []);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
