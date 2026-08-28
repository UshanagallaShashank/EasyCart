// Business logic for the health check.
import { is_db_connected } from '../db/db.js';
import { AppError } from '../shared/app-error.js';

export async function get_health_status() {
  if (!(await is_db_connected())) {
    throw new AppError('Database is not connected', 503);
  }
  return { status: 'ok', timestamp: new Date().toISOString() };
}
