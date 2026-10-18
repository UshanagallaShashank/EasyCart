import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

async function setup_store_with_order(app) {
  const slug = `store-${randomUUID().slice(0, 8)}`;
  const register = await request(app).post('/api/register').send({
    username: `owner_${randomUUID().slice(0, 8)}`,
    email: `owner-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210',
    store_name: 'Cancel Store',
    slug
  });
  const owner_token = register.body.token;
  const product = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${owner_token}`)
    .send({ name: 'Cancel Widget', price: 5, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 10 });
  await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);

  const customer = await request(app).post('/api/customers/register').send({
    username: `cust_${randomUUID().slice(0, 8)}`,
    email: `cust-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210'
  });
  const customer_token = customer.body.token;
  const order = await request(app)
    .post(`/api/stores/${slug}/checkout`)
    .set('Authorization', `Bearer ${customer_token}`)
    .send({ items: [{ product_id: product.body.product.id, quantity: 3 }], payment_method: 'cash_on_delivery' });
  return { owner_token, customer_token, product_id: product.body.product.id, order_id: order.body.order.id };
}

describe('Customer cancels an order', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('cancels a pending order and puts the stock back', async () => {
    const { owner_token, customer_token, product_id, order_id } = await setup_store_with_order(app);

    const res = await request(app).patch(`/api/my-orders/${order_id}/cancel`).set('Authorization', `Bearer ${customer_token}`);
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe('cancelled');

    const product = await request(app).get(`/api/products/${product_id}`).set('Authorization', `Bearer ${owner_token}`);
    expect(product.body.product.stock_quantity).toBe(10);
  });

  it('refuses to cancel an order that is already cancelled', async () => {
    const { customer_token, order_id } = await setup_store_with_order(app);
    await request(app).patch(`/api/my-orders/${order_id}/cancel`).set('Authorization', `Bearer ${customer_token}`);

    const again = await request(app).patch(`/api/my-orders/${order_id}/cancel`).set('Authorization', `Bearer ${customer_token}`);
    expect(again.status).toBe(400);
  });

  it('refuses to cancel an order once the owner confirmed it', async () => {
    const { owner_token, customer_token, order_id } = await setup_store_with_order(app);
    await request(app).patch(`/api/orders/${order_id}/status`).set('Authorization', `Bearer ${owner_token}`).send({ status: 'confirmed' });

    const res = await request(app).patch(`/api/my-orders/${order_id}/cancel`).set('Authorization', `Bearer ${customer_token}`);
    expect(res.status).toBe(400);
  });

  it('does not let another customer cancel the order', async () => {
    const { order_id } = await setup_store_with_order(app);
    const other = await request(app).post('/api/customers/register').send({
      username: `cust_${randomUUID().slice(0, 8)}`,
      email: `cust-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210'
    });
    const res = await request(app).patch(`/api/my-orders/${order_id}/cancel`).set('Authorization', `Bearer ${other.body.token}`);
    expect(res.status).toBe(404);
  });
});
