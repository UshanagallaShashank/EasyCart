import { list_tenant_customers, get_tenant_customer_history } from '../services/tenant-customer-service.js';

export async function handle_list_tenant_customers(req, res, next) {
  try {
    const customers = await list_tenant_customers(req.tenant_id);
    res.status(200).json({ customers });
  } catch (err) {
    next(err);
  }
}

export async function handle_get_tenant_customer(req, res, next) {
  try {
    const customer = await get_tenant_customer_history(req.tenant_id, req.params.id);
    res.status(200).json({ customer });
  } catch (err) {
    next(err);
  }
}
