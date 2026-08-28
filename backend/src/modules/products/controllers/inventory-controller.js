import { AppError } from '../../../platform/shared/app-error.js';
import { adjust_stock } from '../services/product-service.js';

export async function handle_adjust_stock(req, res, next) {
  try {
    const delta = Number(req.body.delta);
    if (!Number.isInteger(delta)) {
      throw new AppError('delta must be an integer', 400);
    }
    const result = await adjust_stock(req.tenant_id, req.params.id, delta);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
