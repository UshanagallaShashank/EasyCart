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
    store_name: 'Notification Test Store',
    slug
  });
  const owner_token = register.body.token;

  const product = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${owner_token}`)
    .send({ name: 'Notif Widget', price: 10, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 50 });
  await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);

  const customer = await request(app).post('/api/customers/register').send({
    username: `cust_${randomUUID().slice(0, 8)}`,
    email: `cust-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210'
  });

  return { slug, owner_token, customer_token: customer.body.token, product_id: product.body.product.id };
}

describe('Notifications', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('creates exactly one order_placed notification for the correct tenant on checkout', async () => {
    const { slug, owner_token, customer_token, product_id } = await setup_published_store_with_product(app);

    await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });

    const response = await request(app).get('/api/notifications').set('Authorization', `Bearer ${owner_token}`);
    expect(response.status).toBe(200);
    expect(response.body.notifications).toHaveLength(1);
    expect(response.body.notifications[0].type).toBe('order_placed');
    expect(response.body.notifications[0].is_read).toBe(false);
  });

  it('marking one notification read does not affect another tenant\'s notifications', async () => {
    const store_a = await setup_published_store_with_product(app);
    const store_b = await setup_published_store_with_product(app);

    await request(app)
      .post(`/api/stores/${store_a.slug}/checkout`)
      .set('Authorization', `Bearer ${store_a.customer_token}`)
      .send({ items: [{ product_id: store_a.product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });
    await request(app)
      .post(`/api/stores/${store_b.slug}/checkout`)
      .set('Authorization', `Bearer ${store_b.customer_token}`)
      .send({ items: [{ product_id: store_b.product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });

    const list_a = await request(app).get('/api/notifications').set('Authorization', `Bearer ${store_a.owner_token}`);
    const notif_a_id = list_a.body.notifications[0].id;

    const read = await request(app).patch(`/api/notifications/${notif_a_id}/read`).set('Authorization', `Bearer ${store_a.owner_token}`);
    expect(read.status).toBe(200);
    expect(read.body.notification.is_read).toBe(true);

    const list_b = await request(app).get('/api/notifications').set('Authorization', `Bearer ${store_b.owner_token}`);
    expect(list_b.body.notifications[0].is_read).toBe(false);
  });

  it('rejects marking another tenant\'s notification as read', async () => {
    const store_a = await setup_published_store_with_product(app);
    const store_b = await setup_published_store_with_product(app);

    await request(app)
      .post(`/api/stores/${store_a.slug}/checkout`)
      .set('Authorization', `Bearer ${store_a.customer_token}`)
      .send({ items: [{ product_id: store_a.product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });

    const list_a = await request(app).get('/api/notifications').set('Authorization', `Bearer ${store_a.owner_token}`);
    const notif_a_id = list_a.body.notifications[0].id;

    const response = await request(app).patch(`/api/notifications/${notif_a_id}/read`).set('Authorization', `Bearer ${store_b.owner_token}`);
    expect(response.status).toBe(404);
  });
});
