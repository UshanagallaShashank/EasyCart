// Vercel entry point: every /api request runs through the Express app. Vercel has no always-on server,
// so the app is not started here and the background dispatch loop is replaced by a check on incoming requests.
import { app } from '../src/server-main.js';
import { connect_db } from '../src/platform/db/db.js';
import { assert_production_env } from '../src/env.js';
import { refresh_dispatch } from '../src/modules/delivery/services/dispatch-service.js';

const DISPATCH_EVERY_MS = 10 * 1000;

let ready = null;
let last_dispatch_at = 0;

function prepare_once() {
  if (!ready) {
    assert_production_env();
    ready = connect_db();
  }
  return ready;
}

// Hands waiting deliveries to riders and moves unanswered offers on, at most once every 10 seconds.
async function dispatch_if_due() {
  if (Date.now() - last_dispatch_at < DISPATCH_EVERY_MS) return;
  last_dispatch_at = Date.now();
  try {
    await refresh_dispatch();
  } catch (err) {
    console.warn('Dispatch check failed:', err?.message || err);
  }
}

export default async function handler(req, res) {
  await prepare_once();
  await dispatch_if_due();
  return app(req, res);
}
