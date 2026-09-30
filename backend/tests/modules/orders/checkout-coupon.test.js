import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

async function setup_published_store_with_product(app, price = 100) {
  const slug = `store-${randomUUID().slice(0, 8)}`;
  const register = await request(app).post('/api/register').send({
    username: `owner_${randomUUID().slice(0, 8)}`,
    email: `owner-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210',
    store_name: 'Checkout Coupon Store',
    slug
  });
  const owner_token = register.body.token;

  const product = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${owner_token}`)
    .send({ name: 'Coupon Widget', price, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 50 });
  await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);

  const customer = await request(app).post('/api/customers/register').send({
    username: `cust_${randomUUID().slice(0, 8)}`,
    email: `cust-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210'
  });

  return { slug, owner_token, customer_token: customer.body.token, product_id: product.body.product.id };
}

describe('Checkout with coupon', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('applies a percent discount to the subtotal', async () => {
    const { slug, owner_token, customer_token, product_id } = await setup_published_store_with_product(app, 100);
    await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ code: 'PCT20', discount_type: 'percent', discount_value: 20 });

    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery', coupon_code: 'pct20' });
    expect(response.status).toBe(201);
    expect(response.body.order.total).toBe(80);
    expect(response.body.order.discount_amount).toBe(20);
    expect(response.body.order.coupon_code).toBe('PCT20');
  });

  it('applies a flat discount, capped so it never makes the total negative', async () => {
    const { slug, owner_token, customer_token, product_id } = await setup_published_store_with_product(app, 5);
    await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ code: 'FLAT50', discount_type: 'flat', discount_value: 50 });

    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery', coupon_code: 'FLAT50' });
    expect(response.status).toBe(201);
    expect(response.body.order.total).toBe(0);
    expect(response.body.order.discount_amount).toBe(5);
  });

  it('applies the discount before the delivery fee, not after', async () => {
    const { slug, owner_token, customer_token, product_id } = await setup_published_store_with_product(app, 100);
    await request(app).patch('/api/stores/me').set('Authorization', `Bearer ${owner_token}`).send({ delivery_fee: 10 });
    await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ code: 'HALF', discount_type: 'percent', discount_value: 50 });

    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({
        items: [{ product_id, quantity: 1 }],
        payment_method: 'cash_on_delivery',
        fulfillment_method: 'delivery',
        delivery_address: '1 Test St',
        coupon_code: 'HALF'
      });
    expect(response.status).toBe(201);
    expect(response.body.order.discount_amount).toBe(50);
    expect(response.body.order.delivery_fee).toBe(10);
    expect(response.body.order.total).toBe(60);
  });

  it('rejects an unknown coupon code before creating any order', async () => {
    const { slug, customer_token, product_id } = await setup_published_store_with_product(app);
    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery', coupon_code: 'NOPE' });
    expect(response.status).toBe(400);
  });

  it('rejects a deactivated coupon', async () => {
    const { slug, owner_token, customer_token, product_id } = await setup_published_store_with_product(app);
    const create = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ code: 'GONE', discount_type: 'flat', discount_value: 5 });
    await request(app).patch(`/api/coupons/${create.body.coupon.id}`).set('Authorization', `Bearer ${owner_token}`).send({ is_active: false });

    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery', coupon_code: 'GONE' });
    expect(response.status).toBe(400);
  });

  it('rejects a coupon that belongs to a different tenant', async () => {
    const store_a = await setup_published_store_with_product(app);
    const store_b = await setup_published_store_with_product(app);
    await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${store_a.owner_token}`)
      .send({ code: 'ONLYA', discount_type: 'flat', discount_value: 5 });

    const response = await request(app)
      .post(`/api/stores/${store_b.slug}/checkout`)
      .set('Authorization', `Bearer ${store_b.customer_token}`)
      .send({ items: [{ product_id: store_b.product_id, quantity: 1 }], payment_method: 'cash_on_delivery', coupon_code: 'ONLYA' });
    expect(response.status).toBe(400);
  });

  it('checkout without a coupon still works and stores null/zero', async () => {
    const { slug, customer_token, product_id } = await setup_published_store_with_product(app);
    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });
    expect(response.status).toBe(201);
    expect(response.body.order.coupon_code).toBe(null);
    expect(response.body.order.discount_amount).toBe(0);
  });
});
