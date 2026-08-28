import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

function customer_payload(overrides = {}) {
  return {
    username: `cust_${randomUUID().slice(0, 8)}`,
    email: `cust-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210',
    ...overrides
  };
}

describe('Customer routes', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('registers a customer', async () => {
    const response = await request(app).post('/api/customers/register').send(customer_payload());
    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();
  });

  it('rejects a duplicate email', async () => {
    const payload = customer_payload();
    const first = await request(app).post('/api/customers/register').send(payload);
    expect(first.status).toBe(201);
    const second = await request(app).post('/api/customers/register').send(customer_payload({ email: payload.email }));
    expect(second.status).toBe(409);
  });

  it('logs a customer in', async () => {
    const payload = customer_payload();
    await request(app).post('/api/customers/register').send(payload);
    const response = await request(app).post('/api/customers/login').send({ email: payload.email, password: payload.password });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
  });

  it('rejects a tenant owner logging in as a customer', async () => {
    const owner_email = `owner-${randomUUID()}@example.com`;
    const owner_password = 'ExamplePass123!';
    await request(app).post('/api/register').send({
      username: `owner_${randomUUID().slice(0, 8)}`,
      email: owner_email,
      password: owner_password,
      phone_number: '9876543210',
      store_name: 'Cross Role Store',
      slug: `store-${randomUUID().slice(0, 8)}`
    });
    const response = await request(app).post('/api/customers/login').send({ email: owner_email, password: owner_password });
    expect(response.status).toBe(401);
  });

  it('rejects a customer token on an owner-only route', async () => {
    const payload = customer_payload();
    const register = await request(app).post('/api/customers/register').send(payload);
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${register.body.token}`)
      .send({ name: 'x', price: 1, sku: `sku-${randomUUID()}` });
    expect(response.status).toBe(403);
  });
});
