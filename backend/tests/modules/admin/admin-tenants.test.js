import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';
import { hash_password } from '../../../src/platform/shared/hash.js';
import { save_user } from '../../../src/modules/users/repositories/user-repository.js';
import { sign_token } from '../../../src/platform/shared/jwt.js';

describe('Admin tenant management', () => {
  const app = create_express_app();
  const slug = `admin-test-${randomUUID().slice(0, 8)}`;
  let ownerToken;
  let adminToken;
  let tenantId;

  beforeAll(async () => {
    await connect_db();

    const registerResponse = await request(app)
      .post('/api/register')
      .send({
        username: `owner_${randomUUID().slice(0, 8)}`,
        email: `owner-${randomUUID()}@example.com`,
        password: 'ExamplePass123!',
        phone_number: '9876543210',
        store_name: 'Admin Test Store',
        slug
      });
    ownerToken = registerResponse.body.token;
    tenantId = registerResponse.body.tenant.id;

    const adminUser = await save_user({
      id: randomUUID(),
      username: `admin_${randomUUID().slice(0, 8)}`,
      email: `admin-${randomUUID()}@example.com`,
      phone_number: '9876543210',
      password_hash: await hash_password('AdminPass123!'),
      role: 'platform_admin',
      tenant_id: null
    });
    adminToken = sign_token({ sub: adminUser.id, email: adminUser.email, username: adminUser.username, role: adminUser.role, tenant_id: null });

    await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${ownerToken}`);
  });

  it('rejects non-admin callers', async () => {
    const response = await request(app).get('/api/admin/tenants').set('Authorization', `Bearer ${ownerToken}`);
    expect(response.status).toBe(403);
  });

  it('lists all tenants for an admin, including the owner and publish state', async () => {
    const response = await request(app).get('/api/admin/tenants').set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    const tenant = response.body.tenants.find((t) => t.id === tenantId);
    expect(tenant).toBeDefined();
    expect(tenant.slug).toBe(slug);
    expect(tenant.status).toBe('active');
    expect(tenant.is_published).toBe(true);
    expect(tenant.owner_email).toBeTruthy();
  });

  it('suspends a tenant and hides its storefront from the public', async () => {
    const suspend = await request(app).post(`/api/admin/tenants/${tenantId}/suspend`).set('Authorization', `Bearer ${adminToken}`);
    expect(suspend.status).toBe(200);
    expect(suspend.body.tenant.status).toBe('suspended');

    const preview = await request(app).get(`/api/stores/${slug}`);
    expect(preview.status).toBe(404);
  });

  it('reactivates a tenant and restores its storefront', async () => {
    const reactivate = await request(app).post(`/api/admin/tenants/${tenantId}/reactivate`).set('Authorization', `Bearer ${adminToken}`);
    expect(reactivate.status).toBe(200);
    expect(reactivate.body.tenant.status).toBe('active');

    const preview = await request(app).get(`/api/stores/${slug}`);
    expect(preview.status).toBe(200);
  });

  it('returns store detail with owner and activity for an admin', async () => {
    const response = await request(app).get(`/api/admin/tenants/${tenantId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    expect(response.body.tenant.slug).toBe(slug);
    expect(response.body.store.is_published).toBe(true);
    expect(response.body.owner.email).toBeTruthy();
    expect(response.body.activity).toMatchObject({ product_count: 0, order_count: 0, revenue: 0 });
  });

  it('returns 404 for an unknown store', async () => {
    const response = await request(app).get(`/api/admin/tenants/${randomUUID()}`).set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(404);
  });
});
