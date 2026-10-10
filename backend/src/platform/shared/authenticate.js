// Verifies the Authorization header and attaches the caller to req.user.
import { AppError } from './app-error.js';
import { verify_token } from './jwt.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Missing or invalid token', 401);
  }

  try {
    const payload = verify_token(token);
    req.user = { id: payload.sub, email: payload.email, username: payload.username, role: payload.role, tenant_id: payload.tenant_id };
    next();
  } catch {
    throw new AppError('Missing or invalid token', 401);
  }
}
