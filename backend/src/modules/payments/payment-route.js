import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { require_any_role } from '../../platform/shared/require-any-role.js';
import { sensitive_route_limiter } from '../../platform/shared/rate-limit.js';
import { handle_get_config, handle_start_payment, handle_confirm_payment } from './payment-controller.js';

export const payment_router = Router();

const customer_only = [authenticate, require_any_role('customer')];

// Public: lets the app know whether to show "Pay online" at all.
payment_router.get('/config', handle_get_config);
payment_router.post('/my-orders/:id/pay/start', sensitive_route_limiter, ...customer_only, handle_start_payment);
payment_router.post('/my-orders/:id/pay/confirm', sensitive_route_limiter, ...customer_only, handle_confirm_payment);
