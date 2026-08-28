import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('MVP purchase flow, end to end', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('register -> store -> product -> publish -> customer -> browse -> checkout -> order -> status -> payment -> stock', async () => {
    const slug = `store-${randomUUID().slice(0, 8)}`;

    const owner = await request(app).post('/api/register').send({
      username: `owner_${randomUUID().slice(0, 8)}`,
      email: `owner-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210',
      store_name: 'MVP Flow Store',
      slug
    });
    expect(owner.status).toBe(201);
    const owner_token = owner.body.token;

    const product = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ name: 'MVP Widget', price: 25, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 10 });
    expect(product.status).toBe(201);

    const publish = await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);
    expect(publish.status).toBe(200);

    const customer = await request(app).post('/api/customers/register').send({
      username: `cust_${randomUUID().slice(0, 8)}`,
      email: `cust-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210'
    });
    expect(customer.status).toBe(201);
    const customer_token = customer.body.token;

    const browse = await request(app).get(`/api/stores/${slug}/products`);
    expect(browse.status).toBe(200);
    expect(browse.body.products.some((p) => p.id === product.body.product.id)).toBe(true);

    const checkout = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id: product.body.product.id, quantity: 2 }], payment_method: 'cash_on_delivery' });
    expect(checkout.status).toBe(201);
    expect(checkout.body.order.status).toBe('pending');
    expect(checkout.body.order.payment_status).toBe('unpaid');
    const order_id = checkout.body.order.id;

    const owner_sees_it = await request(app).get('/api/orders').set('Authorization', `Bearer ${owner_token}`);
    expect(owner_sees_it.body.orders.some((o) => o.id === order_id)).toBe(true);

    const customer_sees_it = await request(app).get('/api/my-orders').set('Authorization', `Bearer ${customer_token}`);
    expect(customer_sees_it.body.orders.some((o) => o.id === order_id)).toBe(true);

    const confirm = await request(app)
      .patch(`/api/orders/${order_id}/status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ status: 'confirmed' });
    expect(confirm.body.order.status).toBe('confirmed');

    const paid = await request(app)
      .patch(`/api/orders/${order_id}/payment-status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ payment_status: 'paid' });
    expect(paid.body.order.payment_status).toBe('paid');

    const final_product = await request(app).get(`/api/products/${product.body.product.id}`).set('Authorization', `Bearer ${owner_token}`);
    expect(final_product.body.product.stock_quantity).toBe(8);
  });
});
