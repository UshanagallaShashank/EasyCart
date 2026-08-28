import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Store publish/unpublish', () => {
  const app = create_express_app();
  const slug = `store-${randomUUID().slice(0, 8)}`;
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
        store_name: 'Publish Test Store',
        slug
      });
    token = response.body.token;
  });

  it('hides an unpublished store from the public preview', async () => {
    const response = await request(app).get(`/api/stores/${slug}`);
    expect(response.status).toBe(404);
  });

  it('publishes and shows only public-safe fields', async () => {
    const publish = await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${token}`);
    expect(publish.status).toBe(200);

    const preview = await request(app).get(`/api/stores/${slug}`);
    expect(preview.status).toBe(200);
    expect(preview.body.store.slug).toBe(slug);
    expect(preview.body.store.tenant_id).toBeUndefined();
    expect(preview.body.store.id).toBeUndefined();
  });

  it('unpublishes and hides it again', async () => {
    const unpublish = await request(app).post('/api/stores/me/unpublish').set('Authorization', `Bearer ${token}`);
    expect(unpublish.status).toBe(200);

    const preview = await request(app).get(`/api/stores/${slug}`);
    expect(preview.status).toBe(404);
  });
});
