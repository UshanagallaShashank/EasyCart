import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

async function register_owner(app) {
  const response = await request(app)
    .post('/api/register')
    .send({
      username: `user_${randomUUID().slice(0, 8)}`,
      email: `user-${randomUUID()}@example.com`,
      password: 'ExamplePass123!',
      phone_number: '9876543210',
      store_name: 'Category Test Store',
      slug: `store-${randomUUID().slice(0, 8)}`
    });
  return response.body.token;
}

describe('Category routes', () => {
  const app = create_express_app();
  let token_a;
  let token_b;

  beforeAll(async () => {
    await connect_db();
    token_a = await register_owner(app);
    token_b = await register_owner(app);
  });

  it('creates, lists, and deletes a category for the owning tenant', async () => {
    const create = await request(app).post('/api/categories').set('Authorization', `Bearer ${token_a}`).send({ name: 'Beverages' });
    expect(create.status).toBe(201);
    const id = create.body.category.id;

    const list = await request(app).get('/api/categories').set('Authorization', `Bearer ${token_a}`);
    expect(list.body.categories.some((c) => c.id === id)).toBe(true);

    const del = await request(app).delete(`/api/categories/${id}`).set('Authorization', `Bearer ${token_a}`);
    expect(del.status).toBe(200);

    const list_after = await request(app).get('/api/categories').set('Authorization', `Bearer ${token_a}`);
    expect(list_after.body.categories.some((c) => c.id === id)).toBe(false);
  });

  it('does not let another tenant see or delete this tenant\'s category', async () => {
    const create = await request(app).post('/api/categories').set('Authorization', `Bearer ${token_a}`).send({ name: 'Snacks' });
    const id = create.body.category.id;

    const list_b = await request(app).get('/api/categories').set('Authorization', `Bearer ${token_b}`);
    expect(list_b.body.categories.some((c) => c.id === id)).toBe(false);

    const del_b = await request(app).delete(`/api/categories/${id}`).set('Authorization', `Bearer ${token_b}`);
    expect(del_b.status).toBe(404);
  });

  it('rejects a duplicate category name for the same tenant', async () => {
    await request(app).post('/api/categories').set('Authorization', `Bearer ${token_a}`).send({ name: 'Dairy' });
    const second = await request(app).post('/api/categories').set('Authorization', `Bearer ${token_a}`).send({ name: 'Dairy' });
    expect(second.status).toBe(409);
    expect(second.body.error).toBe('Category name already in use');
  });

  it('allows the same category name for a different tenant', async () => {
    await request(app).post('/api/categories').set('Authorization', `Bearer ${token_a}`).send({ name: 'Frozen' });
    const other_tenant = await request(app).post('/api/categories').set('Authorization', `Bearer ${token_b}`).send({ name: 'Frozen' });
    expect(other_tenant.status).toBe(201);
  });
});
