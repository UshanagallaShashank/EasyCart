// Notes every request that failed or was slow, with how long it took. Only the path is kept (never the query string,
// headers or body), so tokens and personal details never reach the logs.
import { log_event } from './log.js';

const SLOW_MS = 1500;
// The live-updates stream stays open for minutes on purpose, so it is never "slow".
const LONG_LIVED_PATHS = ['/api/live'];

export function request_log(req, res, next) {
  if (LONG_LIVED_PATHS.includes(req.baseUrl + req.path)) return next();
  const started = process.hrtime.bigint();
  res.on('finish', () => {
    const took_ms = Math.round(Number(process.hrtime.bigint() - started) / 1e6);
    const context = { method: req.method, path: req.baseUrl + req.path, status: res.statusCode, took_ms };
    if (res.statusCode >= 500) log_event('error', 'Request failed', context);
    else if (took_ms >= SLOW_MS) log_event('warn', 'Slow request', context);
  });
  next();
}
