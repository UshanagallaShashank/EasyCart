import { list_all_tenants, suspend_tenant, reactivate_tenant } from '../services/admin-service.js';
import { get_tenant_detail } from '../services/admin-tenant-detail-service.js';

export async function handle_list_tenants(req, res, next) {
  try {
    const tenants = await list_all_tenants();
    res.status(200).json({ tenants });
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
