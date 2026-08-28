import { Router } from 'express';
import { handle_signup, handle_login } from './auth-controller.js';

export const auth_router = Router();

auth_router.post('/register', handle_signup);
auth_router.post('/login', handle_login);
