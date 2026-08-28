import { checkout } from '../services/checkout-service.js';

export async function handle_checkout(req, res, next) {
  try {
    const order = await checkout(req.tenant_id, req.user.id, req.body);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}
