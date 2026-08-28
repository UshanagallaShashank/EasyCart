import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

describe('Login route', () => {
  const app = create_express_app();
  const email = `login-${randomUUID()}@example.com`;
  const password = 'ExamplePass123!';

  beforeAll(async () => {
    await connect_db();
    await request(app).post('/api/register').send({
      username: `login_${randomUUID().slice(0, 8)}`,
      email,
      password,
      phone_number: '9876543210',
      store_name: 'Login Test Store',
      slug: `store-${randomUUID().slice(0, 8)}`
    });
  });

  it('logs in with correct credentials', async () => {
    const response = await request(app).post('/api/login').send({ email, password });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
  });

  it('rejects a wrong password with a generic message', async () => {
    const response = await request(app).post('/api/login').send({ email, password: 'WrongPass123!' });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
  });

  it('rejects an unknown email with the same generic message', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: `nobody-${randomUUID()}@example.com`, password });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
  });
});
