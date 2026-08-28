// Rate limiter applied to abuse-prone endpoints (login, registration, checkout).
import rateLimit from 'express-rate-limit';

const no_op = (req, res, next) => next();

export const sensitive_route_limiter =
  process.env.NODE_ENV === 'test'
    ? no_op
    : rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
