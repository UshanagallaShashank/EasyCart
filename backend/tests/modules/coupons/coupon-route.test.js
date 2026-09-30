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
      store_name: 'Coupon Test Store',
      slug: `store-${randomUUID().slice(0, 8)}`
    });
  return response.body.token;
}

describe('Coupon routes', () => {
  const app = create_express_app();
  let token_a;
  let token_b;

  beforeAll(async () => {
    await connect_db();
    token_a = await register_owner(app);
    token_b = await register_owner(app);
  });

  it('creates, lists, deactivates, and deletes a coupon for the owning tenant', async () => {
    const create = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${token_a}`)
      .send({ code: 'welcome10', discount_type: 'flat', discount_value: 10 });
    expect(create.status).toBe(201);
    expect(create.body.coupon.code).toBe('WELCOME10');
    const id = create.body.coupon.id;

    const list = await request(app).get('/api/coupons').set('Authorization', `Bearer ${token_a}`);
    expect(list.body.coupons.some((c) => c.id === id)).toBe(true);

    const deactivate = await request(app).patch(`/api/coupons/${id}`).set('Authorization', `Bearer ${token_a}`).send({ is_active: false });
    expect(deactivate.status).toBe(200);
    expect(deactivate.body.coupon.is_active).toBe(false);

    const del = await request(app).delete(`/api/coupons/${id}`).set('Authorization', `Bearer ${token_a}`);
    expect(del.status).toBe(200);
  });

  it('rejects a duplicate code for the same tenant but allows it for a different tenant', async () => {
    await request(app).post('/api/coupons').set('Authorization', `Bearer ${token_a}`).send({ code: 'DUPTEST', discount_type: 'flat', discount_value: 5 });
    const dup = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${token_a}`)
      .send({ code: 'DUPTEST', discount_type: 'percent', discount_value: 15 });
    expect(dup.status).toBe(409);

    const other_tenant = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${token_b}`)
      .send({ code: 'DUPTEST', discount_type: 'flat', discount_value: 5 });
    expect(other_tenant.status).toBe(201);
  });

  it('rejects a percent discount over 100', async () => {
    const response = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${token_a}`)
      .send({ code: 'TOOMUCH', discount_type: 'percent', discount_value: 150 });
    expect(response.status).toBe(400);
  });

  it('does not let another tenant deactivate or delete this tenant\'s coupon', async () => {
    const create = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${token_a}`)
      .send({ code: 'ISOLATED', discount_type: 'flat', discount_value: 1 });
    const id = create.body.coupon.id;

    const patch_b = await request(app).patch(`/api/coupons/${id}`).set('Authorization', `Bearer ${token_b}`).send({ is_active: false });
    expect(patch_b.status).toBe(404);

    const del_b = await request(app).delete(`/api/coupons/${id}`).set('Authorization', `Bearer ${token_b}`);
    expect(del_b.status).toBe(404);
  });
});
