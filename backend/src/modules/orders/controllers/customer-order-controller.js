import { list_orders_for_customer, get_order_for_customer, cancel_order_for_customer, list_stores_for_customer } from '../services/order-service.js';

export async function handle_list_my_orders(req, res, next) {
  try {
    const orders = await list_orders_for_customer(req.user.id);
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function handle_get_my_order(req, res, next) {
  try {
    const order = await get_order_for_customer(req.user.id, req.params.id);
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function handle_cancel_my_order(req, res, next) {
  try {
    const order = await cancel_order_for_customer(req.user.id, req.params.id);
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function handle_list_my_stores(req, res, next) {
  try {
    const stores = await list_stores_for_customer(req.user.id);
    res.status(200).json({ stores });
  } catch (err) {
    next(err);
  }
}
