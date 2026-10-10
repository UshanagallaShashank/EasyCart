// Rejects requests unless the authenticated user has the required role.
import { AppError } from './app-error.js';

export function require_role(role) {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Missing or invalid token', 401);
    }
    if (req.user.role !== role) {
      throw new AppError('Forbidden', 403);
    }
    next();
  };
}
