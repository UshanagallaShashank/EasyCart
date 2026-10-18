import { get_owner_earnings, get_platform_earnings } from './earnings-service.js';

export async function handle_owner_earnings(req, res, next) {
  try {
    res.status(200).json({ earnings: await get_owner_earnings(req.tenant_id) });
  } catch (err) {
    next(err);
  }
}

export async function handle_platform_earnings(req, res, next) {
  try {
    res.status(200).json({ earnings: await get_platform_earnings() });
  } catch (err) {
    next(err);
  }
}
