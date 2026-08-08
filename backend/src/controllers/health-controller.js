// Handles the HTTP request/response for the health check route.
import { get_health_status } from '../services/health-service.js';

export function handle_health_check(req, res) {
  res.status(200).json(get_health_status());
}
