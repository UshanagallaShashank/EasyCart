// Platform admin read endpoints (store detail, stats, users) must reject anyone who is not a platform admin, before any database work.
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { sign_token } from '../../../src/platform/shared/jwt.js';

describe('GET /api/admin/tenants/:id guards', () => {
  const app = create_express_app();

  it('rejects requests without a token', async () => {
    const response = await request(app).get('/api/admin/tenants/some-id');
    expect(response.status).toBe(401);
  });

  it('rejects store owners', async () => {
    const token = sign_token({ sub: 'owner-1', role: 'tenant_owner', tenant_id: 't-1' });
    const response = await request(app).get('/api/admin/tenants/some-id').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  it('rejects store owners on platform stats and the user directory', async () => {
    const token = sign_token({ sub: 'owner-1', role: 'tenant_owner', tenant_id: 't-1' });
    for (const path of ['/api/admin/stats', '/api/admin/users']) {
      const response = await request(app).get(path).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(403);
    }
  });
});
