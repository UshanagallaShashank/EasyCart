// Express router defining the platform health check endpoint.
import { Router } from 'express';

export const health_router = Router();

export function handle_health_check(req, res) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}

health_router.get('/health', handle_health_check);
