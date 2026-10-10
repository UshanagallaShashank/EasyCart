import { Router } from 'express';
import { authenticate } from '../../platform/shared/authenticate.js';
import { handle_translate } from './translate-controller.js';

export const translate_router = Router();

// Signed-in people only, because every new text can cost a little money.
translate_router.post('/translate', authenticate, handle_translate);
