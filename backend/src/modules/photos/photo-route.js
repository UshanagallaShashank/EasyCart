import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { require_any_role } from '../../platform/shared/require-any-role.js';
import { sensitive_route_limiter } from '../../platform/shared/rate-limit.js';
import { upload_order_photo } from './customer-photo-service.js';

export const photo_router = Router();

// A customer adds a photo to one of their own orders, for a rating or a refund request.
photo_router.post('/my-orders/:id/photos', sensitive_route_limiter, authenticate, require_any_role('customer'), async (req, res, next) => {
  try {
    res.status(201).json(await upload_order_photo({ customer_id: req.user.id, order_id: req.params.id, purpose: req.body?.purpose, file: req.body?.file }));
  } catch (err) {
    next(err);
  }
});
