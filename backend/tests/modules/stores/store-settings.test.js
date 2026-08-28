import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Store settings', () => {
  const app = create_express_app();
  let token;

  beforeAll(async () => {
    await connect_db();
    const response = await request(app)
      .post('/api/register')
      .send({
        username: `owner_${randomUUID().slice(0, 8)}`,
        email: `owner-${randomUUID()}@example.com`,
        password: 'ExamplePass123!',
        phone_number: '9876543210',
        store_name: 'Settings Test Store',
        slug: `store-${randomUUID().slice(0, 8)}`
      });
    token = response.body.token;
  });

  it('updates store settings with a valid token', async () => {
    const response = await request(app)
      .patch('/api/stores/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'dark' });
    expect(response.status).toBe(200);
    expect(response.body.store.theme).toBe('dark');
  });

  it('rejects an unauthenticated request', async () => {
    const response = await request(app).patch('/api/stores/me').send({ theme: 'dark' });
    expect(response.status).toBe(401);
  });
});
