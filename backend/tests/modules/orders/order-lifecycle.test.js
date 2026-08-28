import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

async function setup_owner_and_order(app) {
  const slug = `store-${randomUUID().slice(0, 8)}`;
  const register = await request(app).post('/api/register').send({
    username: `owner_${randomUUID().slice(0, 8)}`,
    email: `owner-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210',
    store_name: 'Lifecycle Store',
    slug
  });
  const owner_token = register.body.token;
  const product = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${owner_token}`)
    .send({ name: 'Lifecycle Widget', price: 15, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 10 });
  await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);

  const customer = await request(app).post('/api/customers/register').send({
    username: `cust_${randomUUID().slice(0, 8)}`,
    email: `cust-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210'
  });
  const checkout = await request(app)
    .post(`/api/stores/${slug}/checkout`)
    .set('Authorization', `Bearer ${customer.body.token}`)
    .send({ items: [{ product_id: product.body.product.id, quantity: 1 }], payment_method: 'cash_on_delivery' });

  return { owner_token, order_id: checkout.body.order.id };
}

describe('Order lifecycle (owner side)', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('owner sees the order in their list and can fetch it directly', async () => {
    const { owner_token, order_id } = await setup_owner_and_order(app);
    const list = await request(app).get('/api/orders').set('Authorization', `Bearer ${owner_token}`);
    expect(list.body.orders.some((o) => o.id === order_id)).toBe(true);
    const get = await request(app).get(`/api/orders/${order_id}`).set('Authorization', `Bearer ${owner_token}`);
    expect(get.status).toBe(200);
  });

  it('owner updates order status', async () => {
    const { owner_token, order_id } = await setup_owner_and_order(app);
    const response = await request(app)
      .patch(`/api/orders/${order_id}/status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ status: 'confirmed' });
    expect(response.status).toBe(200);
    expect(response.body.order.status).toBe('confirmed');
  });

  it('rejects an invalid status value', async () => {
    const { owner_token, order_id } = await setup_owner_and_order(app);
    const response = await request(app)
      .patch(`/api/orders/${order_id}/status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ status: 'not-a-real-status' });
    expect(response.status).toBe(400);
  });

  it('owner marks payment status paid', async () => {
    const { owner_token, order_id } = await setup_owner_and_order(app);
    const response = await request(app)
      .patch(`/api/orders/${order_id}/payment-status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ payment_status: 'paid' });
    expect(response.status).toBe(200);
    expect(response.body.order.payment_status).toBe('paid');
  });

  it('a different tenant cannot see or modify this order', async () => {
    const { order_id } = await setup_owner_and_order(app);
    const other = await setup_owner_and_order(app);
    const get = await request(app).get(`/api/orders/${order_id}`).set('Authorization', `Bearer ${other.owner_token}`);
    expect(get.status).toBe(404);
    const patch = await request(app)
      .patch(`/api/orders/${order_id}/status`)
      .set('Authorization', `Bearer ${other.owner_token}`)
      .send({ status: 'confirmed' });
    expect(patch.status).toBe(404);
  });
});
