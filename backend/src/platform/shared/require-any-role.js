// Rejects requests unless the authenticated user has one of the allowed roles.
import { AppError } from './app-error.js';

export function require_any_role(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Missing or invalid token', 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError('Forbidden', 403);
    }
    next();
  };
}
