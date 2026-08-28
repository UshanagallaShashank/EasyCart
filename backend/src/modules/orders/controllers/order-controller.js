import { list_orders_for_tenant, get_order_for_tenant, update_order_status, update_order_payment_status } from '../services/order-service.js';

export async function handle_list_orders(req, res, next) {
  try {
    const orders = await list_orders_for_tenant(req.tenant_id);
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function handle_get_order(req, res, next) {
  try {
    const order = await get_order_for_tenant(req.tenant_id, req.params.id);
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function handle_update_order_status(req, res, next) {
  try {
    const order = await update_order_status(req.tenant_id, req.params.id, req.body);
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function handle_update_payment_status(req, res, next) {
  try {
    const order = await update_order_payment_status(req.tenant_id, req.params.id, req.body);
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}
