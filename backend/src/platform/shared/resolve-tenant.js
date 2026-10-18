// Attaches req.tenant_id from the authenticated user's JWT claims.
import { AppError } from './app-error.js';

export function resolve_tenant(req, res, next) {
  if (!req.user.tenant_id) {
    throw new AppError('No tenant associated with this account', 403);
  }
  req.tenant_id = req.user.tenant_id;
  next();
}
