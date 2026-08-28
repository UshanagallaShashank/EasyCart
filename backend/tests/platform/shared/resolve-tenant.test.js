import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { authenticate } from '../../../src/platform/shared/authenticate.js';
import { resolve_tenant } from '../../../src/platform/shared/resolve-tenant.js';
import { error_handler } from '../../../src/platform/shared/error-handler.js';
import { sign_token } from '../../../src/platform/shared/jwt.js';

function build_app() {
  const app = express();
  app.get('/tenant-only', authenticate, resolve_tenant, (req, res) => res.json({ tenant_id: req.tenant_id }));
  app.use(error_handler);
  return app;
}

describe('resolve_tenant middleware', () => {
  it('attaches req.tenant_id from the token', async () => {
    const token = sign_token({ sub: 'user-1', role: 'tenant_owner', tenant_id: 'tenant-1' });
    const response = await request(build_app()).get('/tenant-only').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.tenant_id).toBe('tenant-1');
  });

  it('rejects a token with no tenant_id', async () => {
    const token = sign_token({ sub: 'admin-1', role: 'platform_admin', tenant_id: null });
    const response = await request(build_app()).get('/tenant-only').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });
});
