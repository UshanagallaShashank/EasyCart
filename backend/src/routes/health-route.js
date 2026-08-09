// Defines the /health endpoint.
import { Router } from 'express';
import { handle_health_check } from '../controllers/health-controller.js';

export const health_router = Router();

health_router.get('/health', handle_health_check);
