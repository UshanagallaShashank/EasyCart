import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Checkout route', () => {
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
      store_name: 'Checkout Test Store',
      slug
    });
    owner_token = register.body.token;

    const product = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ name: 'Checkout Widget', price: 20, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 5 });
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

  it('checks out successfully with sufficient stock', async () => {
    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 2 }], payment_method: 'cash_on_delivery' });
    expect(response.status).toBe(201);
    expect(response.body.order.total).toBe(40);
    expect(response.body.order.status).toBe('pending');
    expect(response.body.order.payment_status).toBe('unpaid');
  });

  it('rejects checkout with insufficient stock', async () => {
    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1000 }], payment_method: 'cash_on_delivery' });
    expect(response.status).toBe(400);
  });

  it('rejects checkout from a tenant_owner token', async () => {
    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });
    expect(response.status).toBe(403);
  });

  it('404s for checkout on an unpublished store', async () => {
    const response = await request(app)
      .post(`/api/stores/nonexistent-${randomUUID()}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });
    expect(response.status).toBe(404);
  });
});
