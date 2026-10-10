import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

async function setup_published_store_with_product(app) {
  const slug = `store-${randomUUID().slice(0, 8)}`;
  const register = await request(app).post('/api/register').send({
    username: `owner_${randomUUID().slice(0, 8)}`,
    email: `owner-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210',
    store_name: 'Customer List Test Store',
    slug
  });
  const owner_token = register.body.token;

  const product = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${owner_token}`)
    .send({ name: 'Widget', price: 10, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 50 });
  await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);

  return { slug, owner_token, product_id: product.body.product.id };
}

async function register_customer(app) {
  const response = await request(app).post('/api/customers/register').send({
    username: `cust_${randomUUID().slice(0, 8)}`,
    email: `cust-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210'
  });
  return response.body.token;
}

describe('Tenant customer management', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('lists customers derived from order history, with order count and lifetime total', async () => {
    const { slug, owner_token, product_id } = await setup_published_store_with_product(app);
    const customer_token = await register_customer(app);

    await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 2 }], payment_method: 'cash_on_delivery' });
    await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });

    const response = await request(app).get('/api/customers').set('Authorization', `Bearer ${owner_token}`);
    expect(response.status).toBe(200);
    expect(response.body.customers).toHaveLength(1);
    expect(response.body.customers[0].order_count).toBe(2);
    expect(response.body.customers[0].lifetime_total).toBe(30);
    expect(response.body.customers[0].email).toBeTruthy();
  });

  it('returns an empty list for a tenant with no orders yet', async () => {
    const { owner_token } = await setup_published_store_with_product(app);
    const response = await request(app).get('/api/customers').set('Authorization', `Bearer ${owner_token}`);
    expect(response.status).toBe(200);
    expect(response.body.customers).toEqual([]);
  });

  it('shows the same customer independently, with different stats, across two tenants', async () => {
    const store_a = await setup_published_store_with_product(app);
    const store_b = await setup_published_store_with_product(app);
    const customer_token = await register_customer(app);

    await request(app)
      .post(`/api/stores/${store_a.slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id: store_a.product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });
    await request(app)
      .post(`/api/stores/${store_b.slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id: store_b.product_id, quantity: 5 }], payment_method: 'cash_on_delivery' });

    const list_a = await request(app).get('/api/customers').set('Authorization', `Bearer ${store_a.owner_token}`);
    const list_b = await request(app).get('/api/customers').set('Authorization', `Bearer ${store_b.owner_token}`);
    expect(list_a.body.customers[0].order_count).toBe(1);
    expect(list_a.body.customers[0].lifetime_total).toBe(10);
    expect(list_b.body.customers[0].order_count).toBe(1);
    expect(list_b.body.customers[0].lifetime_total).toBe(50);
  });

  it('gets one customer\'s order history at this tenant', async () => {
    const { slug, owner_token, product_id } = await setup_published_store_with_product(app);
    const customer_token = await register_customer(app);
    const checkout = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });
    const customer_id = checkout.body.order.customer_id;

    const response = await request(app).get(`/api/customers/${customer_id}`).set('Authorization', `Bearer ${owner_token}`);
    expect(response.status).toBe(200);
    expect(response.body.customer.orders).toHaveLength(1);
  });

  it('404s for a customer who has never ordered from this tenant', async () => {
    const { owner_token } = await setup_published_store_with_product(app);
    const response = await request(app).get(`/api/customers/${randomUUID()}`).set('Authorization', `Bearer ${owner_token}`);
    expect(response.status).toBe(404);
  });

  it('rejects a customer token from viewing the owner-only customer list', async () => {
    const { owner_token } = await setup_published_store_with_product(app);
    const customer_token = await register_customer(app);
    const response = await request(app).get('/api/customers').set('Authorization', `Bearer ${customer_token}`);
    expect(response.status).toBe(403);
  });
});
