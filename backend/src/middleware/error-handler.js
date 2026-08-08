// Catches errors from any route: known errors get their real message, unknown ones don't.
import { AppError } from '../utils/app-error.js';

export function error_handler(err, req, res, next) {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.status_code).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Something went wrong' });
}
