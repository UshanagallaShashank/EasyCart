import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Public category routes', () => {
  const app = create_express_app();
  const slug = `store-${randomUUID().slice(0, 8)}`;
  let owner_token;

  beforeAll(async () => {
    await connect_db();
    const register = await request(app).post('/api/register').send({
      username: `owner_${randomUUID().slice(0, 8)}`,
      email: `owner-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210',
      store_name: 'Public Category Store',
      slug
    });
    owner_token = register.body.token;
    await request(app).post('/api/categories').set('Authorization', `Bearer ${owner_token}`).send({ name: 'Snacks' });
  });

  it('404s for an unpublished store', async () => {
    const response = await request(app).get(`/api/stores/${slug}/categories`);
    expect(response.status).toBe(404);
  });

  it('lists categories once published', async () => {
    await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);
    const response = await request(app).get(`/api/stores/${slug}/categories`);
    expect(response.status).toBe(200);
    expect(response.body.categories.some((c) => c.name === 'Snacks')).toBe(true);
    expect(response.body.categories[0].tenant_id).toBeUndefined();
  });
});
