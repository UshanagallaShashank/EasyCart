import { Router } from 'express';
import { handle_signup } from '../controllers/auth-controller.js';

export const auth_router = Router();

auth_router.post('/signup', handle_signup);
auth_router.post('/register', handle_signup);
