// Admin sign-up against a real database: the right passcode creates a platform_admin who can reach admin routes.
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('POST /api/admin/register', () => {
  const app = create_express_app();
  const email = `admin-${randomUUID()}@example.com`;
  const payload = { username: `admin_${randomUUID().slice(0, 8)}`, email, password: 'AdminPass123!', passcode: 'test-admin-passcode' };

  beforeAll(async () => {
    process.env.ADMIN_SIGNUP_PASSCODE = 'test-admin-passcode';
    await connect_db();
  });

  afterAll(() => {
    delete process.env.ADMIN_SIGNUP_PASSCODE;
  });

  it('creates a platform_admin whose token opens admin routes', async () => {
    const response = await request(app).post('/api/admin/register').send(payload);
    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('platform_admin');
    const tenants = await request(app).get('/api/admin/tenants').set('Authorization', `Bearer ${response.body.token}`);
    expect(tenants.status).toBe(200);
  });

  it('refuses to create the same admin twice', async () => {
    const response = await request(app).post('/api/admin/register').send(payload);
    expect(response.status).toBe(409);
  });
});
