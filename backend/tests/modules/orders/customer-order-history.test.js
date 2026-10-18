import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

async function register_store(app, name) {
  const slug = `store-${randomUUID().slice(0, 8)}`;
  const register = await request(app).post('/api/register').send({
    username: `owner_${randomUUID().slice(0, 8)}`,
    email: `owner-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210',
    store_name: name,
    slug
  });
  const owner_token = register.body.token;
  const product = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${owner_token}`)
    .send({ name: 'History Widget', price: 5, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 10 });
  await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);
  return { slug, product_id: product.body.product.id };
}

describe('Customer order history', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('a customer sees their own order across two different tenants', async () => {
    const store_a = await register_store(app, 'History Store A');
    const store_b = await register_store(app, 'History Store B');

    const customer = await request(app).post('/api/customers/register').send({
      username: `cust_${randomUUID().slice(0, 8)}`,
      email: `cust-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210'
    });
    const token = customer.body.token;

    const order_a = await request(app)
      .post(`/api/stores/${store_a.slug}/checkout`)
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ product_id: store_a.product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });
    const order_b = await request(app)
      .post(`/api/stores/${store_b.slug}/checkout`)
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ product_id: store_b.product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });

    const history = await request(app).get('/api/my-orders').set('Authorization', `Bearer ${token}`);
    const ids = history.body.orders.map((o) => o.id);
    expect(ids).toContain(order_a.body.order.id);
    expect(ids).toContain(order_b.body.order.id);
  });

  it('a different customer cannot see or fetch another customer\'s order', async () => {
    const store = await register_store(app, 'History Store C');
    const customer_1 = await request(app).post('/api/customers/register').send({
      username: `cust_${randomUUID().slice(0, 8)}`,
      email: `cust-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210'
    });
    const customer_2 = await request(app).post('/api/customers/register').send({
      username: `cust_${randomUUID().slice(0, 8)}`,
      email: `cust-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210'
    });

    const order = await request(app)
      .post(`/api/stores/${store.slug}/checkout`)
      .set('Authorization', `Bearer ${customer_1.body.token}`)
      .send({ items: [{ product_id: store.product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });

    const history_2 = await request(app).get('/api/my-orders').set('Authorization', `Bearer ${customer_2.body.token}`);
    expect(history_2.body.orders.some((o) => o.id === order.body.order.id)).toBe(false);

    const direct = await request(app).get(`/api/my-orders/${order.body.order.id}`).set('Authorization', `Bearer ${customer_2.body.token}`);
    expect(direct.status).toBe(404);
  });
});
