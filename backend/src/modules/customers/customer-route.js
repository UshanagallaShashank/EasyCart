import { Router } from 'express';
import { sensitive_route_limiter } from '../../platform/shared/rate-limit.js';
import { handle_customer_signup, handle_customer_login } from './customer-controller.js';

export const customer_router = Router();

customer_router.post('/customers/register', sensitive_route_limiter, handle_customer_signup);
customer_router.post('/customers/login', sensitive_route_limiter, handle_customer_login);
