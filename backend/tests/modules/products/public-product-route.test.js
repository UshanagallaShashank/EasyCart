import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Public product routes', () => {
  const app = create_express_app();
  const slug = `store-${randomUUID().slice(0, 8)}`;
  let owner_token;
  let active_product_id;

  beforeAll(async () => {
    await connect_db();
    const register = await request(app).post('/api/register').send({
      username: `owner_${randomUUID().slice(0, 8)}`,
      email: `owner-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210',
      store_name: 'Public Product Store',
      slug
    });
    owner_token = register.body.token;

    const active = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ name: 'Visible Widget', price: 10, sku: `sku-${randomUUID().slice(0, 8)}` });
    active_product_id = active.body.product.id;

    const inactive_create = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ name: 'Hidden Widget', price: 10, sku: `sku-${randomUUID().slice(0, 8)}` });
    await request(app)
      .patch(`/api/products/${inactive_create.body.product.id}`)
      .set('Authorization', `Bearer ${owner_token}`)
      .send({ is_active: false });
  });

  it('404s for an unpublished store', async () => {
    const response = await request(app).get(`/api/stores/${slug}/products`);
    expect(response.status).toBe(404);
  });

  it('lists only active products once published', async () => {
    await request(app).post('/api/stores/me/publish').set('Authorization', `Bearer ${owner_token}`);
    const response = await request(app).get(`/api/stores/${slug}/products`);
    expect(response.status).toBe(200);
    expect(response.body.products.some((p) => p.id === active_product_id)).toBe(true);
    expect(response.body.products.every((p) => p.is_active !== false)).toBe(true);
  });

  it('filters by search', async () => {
    const response = await request(app).get(`/api/stores/${slug}/products`).query({ search: 'Visible' });
    expect(response.status).toBe(200);
    expect(response.body.products.some((p) => p.id === active_product_id)).toBe(true);
  });

  it('returns a single active product publicly', async () => {
    const response = await request(app).get(`/api/stores/${slug}/products/${active_product_id}`);
    expect(response.status).toBe(200);
    expect(response.body.product.id).toBe(active_product_id);
  });
});
