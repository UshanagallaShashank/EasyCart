import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { authenticate } from '../../../src/platform/shared/authenticate.js';
import { require_any_role } from '../../../src/platform/shared/require-any-role.js';
import { error_handler } from '../../../src/platform/shared/error-handler.js';
import { sign_token } from '../../../src/platform/shared/jwt.js';

function build_app() {
  const app = express();
  app.get('/shop-or-own', authenticate, require_any_role('tenant_owner', 'customer'), (req, res) => res.json({ ok: true }));
  app.use(error_handler);
  return app;
}

describe('require_any_role middleware', () => {
  it('rejects an unauthenticated request', async () => {
    const response = await request(build_app()).get('/shop-or-own');
    expect(response.status).toBe(401);
  });

  it('rejects a role not in the allowed list', async () => {
    const token = sign_token({ sub: 'admin-1', role: 'platform_admin' });
    const response = await request(build_app()).get('/shop-or-own').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  it('accepts any role in the allowed list', async () => {
    const owner_token = sign_token({ sub: 'owner-1', role: 'tenant_owner' });
    const customer_token = sign_token({ sub: 'cust-1', role: 'customer' });
    const owner_res = await request(build_app()).get('/shop-or-own').set('Authorization', `Bearer ${owner_token}`);
    const customer_res = await request(build_app()).get('/shop-or-own').set('Authorization', `Bearer ${customer_token}`);
    expect(owner_res.status).toBe(200);
    expect(customer_res.status).toBe(200);
  });
});
