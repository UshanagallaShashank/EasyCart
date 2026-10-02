import { Router } from 'express';
import { sensitive_route_limiter } from '../../platform/shared/rate-limit.js';
import { authenticate } from '../../platform/shared/authenticate.js';
import { handle_signup, handle_login, handle_admin_signup, handle_get_profile, handle_update_profile } from './auth-controller.js';

export const auth_router = Router();

auth_router.post('/register', sensitive_route_limiter, handle_signup);
auth_router.post('/login', sensitive_route_limiter, handle_login);
auth_router.post('/admin/register', sensitive_route_limiter, handle_admin_signup);
auth_router.get('/profile', authenticate, handle_get_profile);
auth_router.patch('/profile', authenticate, handle_update_profile);

