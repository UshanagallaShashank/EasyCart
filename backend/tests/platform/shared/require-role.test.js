import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { authenticate } from '../../../src/platform/shared/authenticate.js';
import { require_role } from '../../../src/platform/shared/require-role.js';
import { error_handler } from '../../../src/platform/shared/error-handler.js';
import { sign_token } from '../../../src/platform/shared/jwt.js';

function build_app() {
  const app = express();
  app.get('/admin-only', authenticate, require_role('platform_admin'), (req, res) => res.json({ ok: true }));
  app.use(error_handler);
  return app;
}

describe('require_role middleware', () => {
  it('rejects a tenant_owner token with 403', async () => {
    const token = sign_token({ sub: 'user-1', role: 'tenant_owner' });
    const response = await request(build_app()).get('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  it('accepts a platform_admin token', async () => {
    const token = sign_token({ sub: 'user-2', role: 'platform_admin' });
    const response = await request(build_app()).get('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
