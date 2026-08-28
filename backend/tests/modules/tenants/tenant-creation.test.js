import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

function register_payload(overrides = {}) {
  return {
    username: `user_${randomUUID().slice(0, 8)}`,
    email: `user-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210',
    store_name: 'A Test Store',
    slug: `store-${randomUUID().slice(0, 8)}`,
    ...overrides
  };
}

describe('Tenant creation on register', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('creates a tenant linked to the new owner', async () => {
    const response = await request(app).post('/api/register').send(register_payload());
    expect(response.status).toBe(201);
    expect(response.body.tenant.owner_id).toBe(response.body.user.id);
  });

  it('rejects a duplicate slug', async () => {
    const slug = `store-${randomUUID().slice(0, 8)}`;
    const first = await request(app).post('/api/register').send(register_payload({ slug }));
    expect(first.status).toBe(201);

    const second = await request(app).post('/api/register').send(register_payload({ slug }));
    expect(second.status).toBe(409);
  });
});
