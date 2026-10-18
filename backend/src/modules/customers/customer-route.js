import { Router } from 'express';
import { sensitive_route_limiter } from '../../platform/shared/rate-limit.js';
import { authenticate } from '../../platform/shared/authenticate.js';
import { require_any_role } from '../../platform/shared/require-any-role.js';
import {
  handle_customer_signup,
  handle_customer_login,
  handle_request_store,
  handle_get_my_store_request
} from './customer-controller.js';

export const customer_router = Router();

customer_router.post('/customers/register', sensitive_route_limiter, handle_customer_signup);
customer_router.post('/customers/login', sensitive_route_limiter, handle_customer_login);
customer_router.post('/customers/store-request', authenticate, require_any_role('customer'), handle_request_store);
customer_router.get('/customers/store-request', authenticate, require_any_role('customer', 'tenant_owner'), handle_get_my_store_request);
