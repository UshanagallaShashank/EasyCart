// Catches errors from any route. Known errors get their real message; unknown ones get a generic one.
// The real error is always logged on the server, so nothing is lost.
import { AppError } from './app-error.js';

export function error_handler(err, req, res, next) {
  if (err instanceof AppError) {
    console.warn(`[${err.status_code}] ${req.method} ${req.originalUrl}: ${err.message}`);
    res.status(err.status_code).json({ error: err.message });
    return;
  }

  // Problems with the request body itself are the sender's fault, not a server crash.
  if (err.type === 'entity.too.large') {
    console.warn(`[413] ${req.method} ${req.originalUrl}: request body too large`);
    res.status(413).json({ error: 'The upload is too large' });
    return;
  }
  if (err.type === 'entity.parse.failed') {
    console.warn(`[400] ${req.method} ${req.originalUrl}: request body is not valid JSON`);
    res.status(400).json({ error: 'Request body is not valid JSON' });
    return;
  }

  console.error(`[500] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ error: 'Something went wrong' });
}

// For any /api address that does not exist.
export function not_found_handler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}
