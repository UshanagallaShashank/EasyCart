import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Auth routes', () => {
  beforeAll(async () => {
    await connect_db();
  });

  it('creates a user, tenant, and store on register', async () => {
    const app = create_express_app();
    const email = `user-${randomUUID()}@example.com`;
    const slug = `store-${randomUUID().slice(0, 8)}`;
    const response = await request(app)
      .post('/api/register')
      .send({
        username: `user_${randomUUID().slice(0, 8)}`,
        email,
        password: 'ExamplePass123!',
        phone_number: '9876543210',
        store_name: 'Example Store',
        slug
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body.user.email).toBe(email);
    expect(response.body.tenant.slug).toBe(slug);
    expect(response.body.token).toBeTruthy();
  });

  it('rejects invalid registration payloads', async () => {
    const app = create_express_app();
    const response = await request(app)
      .post('/api/register')
      .send({
        username: 'example_user',
        email: 'not-an-email',
        password: 'ExamplePass123!',
        phone_number: '9876543210',
        store_name: 'Example Store',
        slug: `store-${randomUUID().slice(0, 8)}`
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid email format');
  });

  it('rejects a reserved slug', async () => {
    const app = create_express_app();
    const response = await request(app)
      .post('/api/register')
      .send({
        username: `user_${randomUUID().slice(0, 8)}`,
        email: `user-${randomUUID()}@example.com`,
        password: 'ExamplePass123!',
        phone_number: '9876543210',
        store_name: 'Example Store',
        slug: 'admin'
      });

    expect(response.status).toBe(400);
  });
});
