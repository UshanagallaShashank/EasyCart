import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';
import { find_customers_with_no_recent_orders } from '../../../src/modules/tenant-customers/services/tenant-customer-service.js';

async function setup_published_store_with_product(app) {
  const slug = `store-${randomUUID().slice(0, 8)}`;
  const register = await request(app).post('/api/register').send({
    username: `owner_${randomUUID().slice(0, 8)}`,
    email: `owner-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210',
    store_name: 'Abandoned Cart Test Store',
    slug
  });
  const owner_token = register.body.token;
  const tenant_id = register.body.tenant.id;

  const product = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${owner_token}`)
    .send({ name: 'Widget', price: 10, sku: `sku-${randomUUID().slice(0, 8)}`, stock_quantity: 50 });
  await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);

  return { slug, owner_token, tenant_id, product_id: product.body.product.id };
}

describe('Abandoned cart detection', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('flags a customer whose last order is older than the cutoff', async () => {
    const { slug, tenant_id, product_id } = await setup_published_store_with_product(app);
    const customer = await request(app).post('/api/customers/register').send({
      username: `cust_${randomUUID().slice(0, 8)}`,
      email: `cust-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210'
    });
    await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer.body.token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });

    const flagged_immediately = await find_customers_with_no_recent_orders(tenant_id, 0);
    expect(flagged_immediately.some((c) => c.customer_id === customer.body.user.id)).toBe(true);
  });

  it('does not flag a customer whose order is within the cutoff window', async () => {
    const { slug, tenant_id, product_id } = await setup_published_store_with_product(app);
    const customer = await request(app).post('/api/customers/register').send({
      username: `cust_${randomUUID().slice(0, 8)}`,
      email: `cust-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210'
    });
    await request(app)
      .post(`/api/stores/${slug}/checkout`)
      .set('Authorization', `Bearer ${customer.body.token}`)
      .send({ items: [{ product_id, quantity: 1 }], payment_method: 'cash_on_delivery' });

    const flagged_with_wide_window = await find_customers_with_no_recent_orders(tenant_id, 30);
    expect(flagged_with_wide_window.some((c) => c.customer_id === customer.body.user.id)).toBe(false);
  });

  it('never flags a customer who has never ordered from this tenant', async () => {
    const { tenant_id } = await setup_published_store_with_product(app);
    const flagged = await find_customers_with_no_recent_orders(tenant_id, 0);
    expect(flagged).toEqual([]);
  });
});
