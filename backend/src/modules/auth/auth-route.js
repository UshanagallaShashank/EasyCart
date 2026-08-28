import { Router } from 'express';
import { sensitive_route_limiter } from '../../platform/shared/rate-limit.js';
import { handle_signup, handle_login } from './auth-controller.js';

export const auth_router = Router();

auth_router.post('/register', sensitive_route_limiter, handle_signup);
auth_router.post('/login', sensitive_route_limiter, handle_login);
