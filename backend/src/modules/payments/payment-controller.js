import { public_payment_config } from './payment-config.js';
import { start_online_payment, confirm_online_payment } from './payment-service.js';

export function handle_get_config(req, res) {
  res.status(200).json(public_payment_config());
}

export async function handle_start_payment(req, res, next) {
  try {
    res.status(200).json({ payment: await start_online_payment(req.user.id, req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function handle_confirm_payment(req, res, next) {
  try {
    res.status(200).json(await confirm_online_payment(req.user.id, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}
