import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { create_express_app } from '../src/server-main.js';

describe('Auth routes', () => {
  it('creates a user on signup', async () => {
    const app = create_express_app();
    const response = await request(app)
      .post('/api/signup')
      .send({
        username: 'new_user',
        email: 'newuser@gmail.com',
        password: 'StrongPass123!',
        phone_number: '9876543210'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body.user.username).toBe('new_user');
    expect(response.body.user.email).toBe('newuser@gmail.com');
    expect(response.body.user.phone_number).toBe('9876543210');
    expect(response.body.token).toBeTruthy();
  });

  it('rejects invalid signup payloads', async () => {
    const app = create_express_app();
    const response = await request(app)
      .post('/api/signup')
      .send({
        username: 'bad_user',
        email: 'bad@yahoo.com',
        password: 'StrongPass123!',
        phone_number: '9876543210'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('@gmail.com');
  });
});
