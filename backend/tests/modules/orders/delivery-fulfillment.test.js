import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

async function setup_published_store_with_product(app, delivery_fee) {
  const slug = `store-${randomUUID().slice(0, 8)}`;
  const register = await request(app).post('/api/register').send({
    username: `owner_${randomUUID().slice(0, 8)}`,
    email: `owner-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210',
    store_name: 'Delivery Test Store',
    slug
  });
  const owner_token = register.body.token;

  if (delivery_fee !== undefined) {
    await request(app).patch('/api/stores/me').set('Authorization', `Bearer ${owner_token}`).send({ delivery_fee });
  }

  const product = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${owner_token}`)
    .send({ name: 'Delivery Widget', price: 10, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 20 });
  await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);

  const customer = await request(app).post('/api/customers/register').send({
    username: `cust_${randomUUID().slice(0, 8)}`,
    email: `cust-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210'
  });

  return { slug, owner_token, customer_token: customer.body.token, product_id: product.body.product.id };
}

describe('Checkout with fulfillment method', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('defaults to pickup when fulfillment_method is omitted, matching pre-Phase-6 clients', async () => {
    const { slug, customer_token, product_id } = await setup_published_store_with_product(app);
    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });
    expect(response.status).toBe(201);
    expect(response.body.order.fulfillment_method).toBe('pickup');
    expect(response.body.order.total).toBe(10);
  });

  it('rejects a delivery checkout with no address', async () => {
    const { slug, customer_token, product_id } = await setup_published_store_with_product(app);
    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery', fulfillment_method: 'delivery' });
    expect(response.status).toBe(400);
  });

  it('adds the store delivery fee to the total for a delivery order, but not for pickup', async () => {
    const { slug, customer_token, product_id } = await setup_published_store_with_product(app, 5);

    const delivery = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({
        items: [{ product_id, quantity: 1 }],
        payment_method: 'cash_on_delivery',
        fulfillment_method: 'delivery',
        delivery_address: '123 Main St'
      });
    expect(delivery.status).toBe(201);
    expect(delivery.body.order.total).toBe(15);
    expect(delivery.body.order.delivery_fee).toBe(5);
    expect(delivery.body.order.delivery_address).toBe('123 Main St');

    const pickup = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery', fulfillment_method: 'pickup' });
    expect(pickup.status).toBe(201);
    expect(pickup.body.order.total).toBe(10);
    expect(pickup.body.order.delivery_fee).toBe(0);
    expect(pickup.body.order.delivery_address).toBe(null);
  });

  it('starts every new order at fulfillment_status not_started', async () => {
    const { slug, customer_token, product_id } = await setup_published_store_with_product(app);
    const response = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery', fulfillment_method: 'pickup' });
    expect(response.body.order.fulfillment_status).toBe('not_started');
    expect(response.body.order.assigned_to).toBe(null);
  });
});

describe('Fulfillment status updates', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  async function checkout_order(app, fulfillment_method, extra = {}) {
    const { slug, owner_token, customer_token, product_id } = await setup_published_store_with_product(app);
    const checkout = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery', fulfillment_method, ...extra });
    return { owner_token, order_id: checkout.body.order.id };
  }

  it('allows a pickup order to move ready_for_pickup -> picked_up', async () => {
    const { owner_token, order_id } = await checkout_order(app, 'pickup');

    const ready = await request(app)
      .patch(`/api/orders/${order_id}/fulfillment-status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ fulfillment_status: 'ready_for_pickup' });
    expect(ready.status).toBe(200);
    expect(ready.body.order.fulfillment_status).toBe('ready_for_pickup');

    const picked_up = await request(app)
      .patch(`/api/orders/${order_id}/fulfillment-status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ fulfillment_status: 'picked_up' });
    expect(picked_up.status).toBe(200);
    expect(picked_up.body.order.fulfillment_status).toBe('picked_up');
  });

  it('allows a delivery order to move dispatched -> delivered', async () => {
    const { owner_token, order_id } = await checkout_order(app, 'delivery', { delivery_address: '1 Test Ave' });

    const dispatched = await request(app)
      .patch(`/api/orders/${order_id}/fulfillment-status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ fulfillment_status: 'dispatched' });
    expect(dispatched.status).toBe(200);
    expect(dispatched.body.order.fulfillment_status).toBe('dispatched');

    const delivered = await request(app)
      .patch(`/api/orders/${order_id}/fulfillment-status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ fulfillment_status: 'delivered' });
    expect(delivered.status).toBe(200);
    expect(delivered.body.order.fulfillment_status).toBe('delivered');
  });

  it('rejects a delivery-only status on a pickup order', async () => {
    const { owner_token, order_id } = await checkout_order(app, 'pickup');
    const response = await request(app)
      .patch(`/api/orders/${order_id}/fulfillment-status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ fulfillment_status: 'dispatched' });
    expect(response.status).toBe(400);
  });

  it('rejects a pickup-only status on a delivery order', async () => {
    const { owner_token, order_id } = await checkout_order(app, 'delivery', { delivery_address: '1 Test Ave' });
    const response = await request(app)
      .patch(`/api/orders/${order_id}/fulfillment-status`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ fulfillment_status: 'ready_for_pickup' });
    expect(response.status).toBe(400);
  });

  it('sets and clears an assignment independently of fulfillment status', async () => {
    const { owner_token, order_id } = await checkout_order(app, 'pickup');

    const assign = await request(app)
      .patch(`/api/orders/${order_id}/assignment`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ assigned_to: 'Alex' });
    expect(assign.status).toBe(200);
    expect(assign.body.order.assigned_to).toBe('Alex');
    expect(assign.body.order.fulfillment_status).toBe('not_started');

    const clear = await request(app)
      .patch(`/api/orders/${order_id}/assignment`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ assigned_to: null });
    expect(clear.status).toBe(200);
    expect(clear.body.order.assigned_to).toBe(null);
  });

  it('rejects fulfillment-status and assignment updates from a different tenant', async () => {
    const { order_id } = await checkout_order(app, 'pickup');
    const other = await setup_published_store_with_product(app);

    const status_update = await request(app)
      .patch(`/api/orders/${order_id}/fulfillment-status`)
      .set('Authorization', `Bearer ${other.owner_token}`)
      .send({ fulfillment_status: 'ready_for_pickup' });
    expect(status_update.status).toBe(404);

    const assignment_update = await request(app)
      .patch(`/api/orders/${order_id}/assignment`)
      .set('Authorization', `Bearer ${other.owner_token}`)
      .send({ assigned_to: 'Intruder' });
    expect(assignment_update.status).toBe(404);
  });
});

describe('Customer-facing fulfillment visibility', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('surfaces fulfillment fields on the customer order response with no separate endpoint', async () => {
    const { slug, customer_token, product_id } = await setup_published_store_with_product(app, 5);
    const checkout = await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer_token}`)
      .send({
        items: [{ product_id, quantity: 1 }],
        payment_method: 'cash_on_delivery',
        fulfillment_method: 'delivery',
        delivery_address: '42 Wallaby Way'
      });
    const order_id = checkout.body.order.id;

    const my_order = await request(app).get(`/api/my-orders/${order_id}`).set('Authorization', `Bearer ${customer_token}`);
    expect(my_order.status).toBe(200);
    expect(my_order.body.order.fulfillment_method).toBe('delivery');
    expect(my_order.body.order.delivery_address).toBe('42 Wallaby Way');
    expect(my_order.body.order.delivery_fee).toBe(5);
    expect(my_order.body.order.fulfillment_status).toBe('not_started');
  });
});
