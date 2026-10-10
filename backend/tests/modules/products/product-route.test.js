import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

async function register_owner(app) {
  const response = await request(app)
    .post('/api/register')
    .send({
      username: `user_${randomUUID().slice(0, 8)}`,
      email: `user-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210',
      store_name: 'Product Test Store',
      slug: `store-${randomUUID().slice(0, 8)}`
    });
  return response.body.token;
}

function product_payload(overrides = {}) {
  return { name: 'Widget', price: 9.99, sku: `sku-${randomUUID().slice(0, 8)}`, ...overrides };
}

describe('Product routes', () => {
  const app = create_express_app();
  let token_a;
  let token_b;

  beforeAll(async () => {
    await connect_db();
    token_a = await register_owner(app);
    token_b = await register_owner(app);
  });

  it('creates, gets, updates, and deletes a product', async () => {
    const create = await request(app).post('/api/products').set('Authorization', `Bearer ${token_a}`).send(product_payload());
    expect(create.status).toBe(201);
    const id = create.body.product.id;

    const get = await request(app).get(`/api/products/${id}`).set('Authorization', `Bearer ${token_a}`);
    expect(get.status).toBe(200);

    const update = await request(app).patch(`/api/products/${id}`).set('Authorization', `Bearer ${token_a}`).send({ price: 12.5 });
    expect(update.status).toBe(200);
    expect(update.body.product.price).toBe(12.5);

    const del = await request(app).delete(`/api/products/${id}`).set('Authorization', `Bearer ${token_a}`);
    expect(del.status).toBe(200);
  });

  it('rejects a duplicate SKU for the same tenant', async () => {
    const sku = `sku-${randomUUID().slice(0, 8)}`;
    const first = await request(app).post('/api/products').set('Authorization', `Bearer ${token_a}`).send(product_payload({ sku }));
    expect(first.status).toBe(201);

    const second = await request(app).post('/api/products').set('Authorization', `Bearer ${token_a}`).send(product_payload({ sku }));
    expect(second.status).toBe(409);
  });

  it('never reveals another tenant\'s product', async () => {
    const create = await request(app).post('/api/products').set('Authorization', `Bearer ${token_a}`).send(product_payload());
    const id = create.body.product.id;

    const get_b = await request(app).get(`/api/products/${id}`).set('Authorization', `Bearer ${token_b}`);
    expect(get_b.status).toBe(404);

    const patch_b = await request(app).patch(`/api/products/${id}`).set('Authorization', `Bearer ${token_b}`).send({ price: 1 });
    expect(patch_b.status).toBe(404);

    const del_b = await request(app).delete(`/api/products/${id}`).set('Authorization', `Bearer ${token_b}`);
    expect(del_b.status).toBe(404);
  });
});
