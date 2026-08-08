// Business logic for the health check.
export function get_health_status() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
