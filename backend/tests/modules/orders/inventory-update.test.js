import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Checkout inventory updates', () => {
  const app = create_express_app();
  const slug = `store-${randomUUID().slice(0, 8)}`;
  let owner_token;
  let customer_token;
  let product_id;

  beforeAll(async () => {
    await connect_db();
    const register = await request(app).post('/api/register').send({
      username: `owner_${randomUUID().slice(0, 8)}`,
      email: `owner-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210',
      store_name: 'Inventory Store',
      slug
    });
    owner_token = register.body.token;
    const product = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ name: 'Inventory Widget', price: 8, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 10 });
    product_id = product.body.product.id;
    await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);

    const customer = await request(app).post('/api/customers/register').send({
      username: `cust_${randomUUID().slice(0, 8)}`,
      email: `cust-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210'
    });
    customer_token = customer.body.token;
  });

  it('decrements stock by the ordered quantity', async () => {
    await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 3 }], payment_method: 'cash_on_delivery' });

    const product = await request(app).get(`/api/products/${product_id}`).set('Authorization', `Bearer ${owner_token}`);
    expect(product.body.product.stock_quantity).toBe(7);
  });

  it('leaves stock unchanged when checkout fails due to insufficient stock', async () => {
    const before = await request(app).get(`/api/products/${product_id}`).set('Authorization', `Bearer ${owner_token}`);
    const failed = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 999 }], payment_method: 'cash_on_delivery' });
    expect(failed.status).toBe(400);

    const after = await request(app).get(`/api/products/${product_id}`).set('Authorization', `Bearer ${owner_token}`);
    expect(after.body.product.stock_quantity).toBe(before.body.product.stock_quantity);
  });
});
