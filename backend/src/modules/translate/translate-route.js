import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { public_translate_limiter } from '../../platform/shared/rate-limit.js';
import { handle_public_translate, handle_translate } from './translate-controller.js';

export const translate_router = Router();

// Signed-in people: whole screens and product lists.
translate_router.post('/translate', authenticate, handle_translate);
// Before sign-in (the sign-in and register screens): short texts only, and only a few requests.
translate_router.post('/translate/public', public_translate_limiter, handle_public_translate);
