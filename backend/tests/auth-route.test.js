import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { create_express_app } from '../src/server-main.js';

describe('Auth routes', () => {
  it('creates a user on signup', async () => {
    const app = create_express_app();
    const response = await request(app)
      .post('/api/signup')
      .send({
        username: 'example_user',
        email: 'example.user@gmail.com',
        password: 'ExamplePass123!',
        phone_number: '9876543210'
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body.user.username).toBe('example_user');
    expect(response.body.user.email).toBe('example.user@gmail.com');
    expect(response.body.user.phone_number).toBe('9876543210');
    expect(response.body.token).toBeTruthy();
  });

  it('rejects invalid signup payloads', async () => {
    const app = create_express_app();
    const response = await request(app)
      .post('/api/signup')
      .send({
        username: 'example_user',
        email: 'example.user@yahoo.com',
        password: 'ExamplePass123!',
        phone_number: '9876543210'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('@gmail.com');
  });
});
