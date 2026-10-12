// Business logic for the health check. It also says when this server started and how long it has been up,
// so the app's status page and outside uptime monitors can see restarts.
import { is_db_connected } from '../db/db.js';
import { AppError } from '../shared/app-error.js';

const STARTED_AT = new Date();

export async function get_health_status() {
  if (!(await is_db_connected())) {
    throw new AppError('Database is not connected', 503);
  }
  const uptime_seconds = Math.floor((Date.now() - STARTED_AT.getTime()) / 1000);
  return { status: 'ok', timestamp: new Date().toISOString(), started_at: STARTED_AT.toISOString(), uptime_seconds };
}
