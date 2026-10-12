// Defines /features (which optional features are on) and the store owner's AI description helper.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../platform/shared/authenticate.js';
import { require_role } from '../../platform/shared/require-role.js';
import { handle_features, handle_product_description } from './ai-controller.js';

export const ai_router = Router();

// A free AI key has a small daily allowance, so each owner gets a few descriptions every 15 minutes.
const ai_limiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next()
  : rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many AI requests, please wait a few minutes' } });

ai_router.get('/features', handle_features);
ai_router.post('/ai/product-description', authenticate, require_role('tenant_owner'), ai_limiter, handle_product_description);
