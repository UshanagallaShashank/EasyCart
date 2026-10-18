// Handles the HTTP request/response for the health check route.
import { get_health_status } from './health-service.js';

export async function handle_health_check(req, res, next) {
  try {
    res.status(200).json(await get_health_status());
  } catch (err) {
    next(err);
  }
}
