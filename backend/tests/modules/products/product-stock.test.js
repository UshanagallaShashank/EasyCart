import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Product stock adjustment', () => {
  const app = create_express_app();
  let token;
  let product_id;

  beforeAll(async () => {
    await connect_db();
    const register = await request(app)
      .post('/api/register')
      .send({
        username: `user_${randomUUID().slice(0, 8)}`,
        email: `user-${randomUUID()}@example.com`,
        password: 'ExamplePass123!',
        phone_number: '9876543210',
        store_name: 'Stock Test Store',
        slug: `store-${randomUUID().slice(0, 8)}`
      });
    token = register.body.token;

    const product = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Stock Widget', price: 5, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 10, low_stock_threshold: 5 });
    product_id = product.body.product.id;
  });

  it('adjusts stock upward', async () => {
    const response = await request(app)
      .post(`/api/products/${product_id}/adjust-stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ delta: 5 });
    expect(response.status).toBe(200);
    expect(response.body.product.stock_quantity).toBe(15);
    expect(response.body.low_stock).toBe(false);
  });

  it('rejects an adjustment that would go negative', async () => {
    const response = await request(app)
      .post(`/api/products/${product_id}/adjust-stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ delta: -100 });
    expect(response.status).toBe(400);
  });

  it('flags low stock when the threshold is reached', async () => {
    const response = await request(app)
      .post(`/api/products/${product_id}/adjust-stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ delta: -10 });
    expect(response.status).toBe(200);
    expect(response.body.product.stock_quantity).toBe(5);
    expect(response.body.low_stock).toBe(true);
  });
});
