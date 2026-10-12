// The server's one logger: prints to the console like before, and also sends warnings and errors to the outside log
// service when LOG_INGEST_URL and LOG_INGEST_TOKEN are set. Its entries say app "backend", so they stay apart from the phone app's.
import { LOG_INGEST_URL, LOG_INGEST_TOKEN, NODE_ENV } from '../../env.js';
import { create_log_sink } from './remote-log-sink.js';

const sink = create_log_sink({ url: LOG_INGEST_URL, token: LOG_INGEST_TOKEN });

function error_details(err) {
  if (!(err instanceof Error)) return err === undefined ? {} : { detail: String(err) };
  return { error: err.message, stack: String(err.stack ?? '').slice(0, 2000) };
}

export function log_event(level, message, context = {}, err) {
  const print = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  if (err === undefined) print(message);
  else print(message, err);
  sink.add({ dt: new Date().toISOString(), level, message, app: 'backend', env: NODE_ENV, ...context, ...error_details(err) });
}

export function flush_logs() {
  return sink.flush();
}
