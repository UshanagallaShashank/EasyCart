import express from 'express';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';
import { resolve_public_tenant } from '../../../src/platform/shared/resolve-public-tenant.js';
import { error_handler } from '../../../src/platform/shared/error-handler.js';

function build_probe_app() {
  const app = express();
  app.get('/stores/:slug/probe', resolve_public_tenant, (req, res) => res.json({ tenant_id: req.tenant_id, store: req.store }));
  app.use(error_handler);
  return app;
}

describe('resolve_public_tenant middleware', () => {
  const app = create_express_app();
  const probe_app = build_probe_app();
  const slug = `store-${randomUUID().slice(0, 8)}`;
  let token;

  beforeAll(async () => {
    await connect_db();
    const register = await request(app).post('/api/register').send({
      username: `owner_${randomUUID().slice(0, 8)}`,
      email: `owner-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210',
      store_name: 'Probe Store',
      slug
    });
    token = register.body.token;
  });

  it('404s for a store that does not exist', async () => {
    const response = await request(probe_app).get(`/stores/nonexistent-${randomUUID()}/probe`);
    expect(response.status).toBe(404);
  });

  it('404s for an unpublished store', async () => {
    const response = await request(probe_app).get(`/stores/${slug}/probe`);
    expect(response.status).toBe(404);
  });

  it('resolves tenant_id for a published store', async () => {
    await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${token}`);
    const response = await request(probe_app).get(`/stores/${slug}/probe`);
    expect(response.status).toBe(200);
    expect(response.body.tenant_id).toBeTruthy();
    expect(response.body.store.slug).toBe(slug);
  });
});
