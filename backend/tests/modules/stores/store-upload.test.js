import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Store asset upload to Supabase', () => {
  const app = create_express_app();
  let token;
  let userId;

  // 1x1 transparent PNG data URL
  const samplePng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  beforeAll(async () => {
    await connect_db();
    const response = await request(app)
      .post('/api/register')
      .send({
        username: `owner_${randomUUID().slice(0, 8)}`,
        email: `owner-${randomUUID()}@example.com`,
        password: 'ExamplePass123!',
        phone_number: '9876543210',
        store_name: 'Upload Test Store',
        slug: `store-${randomUUID().slice(0, 8)}`
      });
    token = response.body.token;
    userId = response.body.user.id;
  });

  it('rejects unauthenticated upload requests', async () => {
    const response = await request(app)
      .post('/api/stores/me/upload-image')
      .send({ file: samplePng, type: 'logo' });
    expect(response.status).toBe(401);
  });

  it('rejects uploads without image data', async () => {
    const response = await request(app)
      .post('/api/stores/me/upload-image')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'logo' });
    expect(response.status).toBe(400);
  });

  it('rejects invalid image data format', async () => {
    const response = await request(app)
      .post('/api/stores/me/upload-image')
      .set('Authorization', `Bearer ${token}`)
      .send({ file: 'not-base64', type: 'logo' });
    expect(response.status).toBe(400);
  });

  it('uploads a logo to Supabase under the user id', async () => {
    const response = await request(app)
      .post('/api/stores/me/upload-image')
      .set('Authorization', `Bearer ${token}`)
      .send({ file: samplePng, type: 'logo' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
    expect(response.body).toHaveProperty('path');
    // Ensure the path is strictly stored under user id: <userId>/logo-<timestamp>.png
    expect(response.body.path).toMatch(new RegExp(`^${userId}/logo-`));
    expect(response.body.url).toContain(userId);
  });

  it('uploads a banner to Supabase under the user id', async () => {
    const response = await request(app)
      .post('/api/stores/me/upload-image')
      .set('Authorization', `Bearer ${token}`)
      .send({ file: samplePng, type: 'banner' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
    expect(response.body).toHaveProperty('path');
    // Ensure the path is strictly stored under user id: <userId>/banner-<timestamp>.png
    expect(response.body.path).toMatch(new RegExp(`^${userId}/banner-`));
    expect(response.body.url).toContain(userId);
  });
});
