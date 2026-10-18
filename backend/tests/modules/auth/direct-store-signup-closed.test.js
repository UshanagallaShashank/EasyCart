// Stores must come from an approved store request, so the direct "sign up with a store" endpoint is closed.
// These tests are refused before any database work, so they write nothing.
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';

const BODY = {
  username: 'owner_closed1',
  email: 'owner-closed@example.com',
  password: 'ExamplePass123!',
  phone_number: '9876543210',
  store_name: 'Closed Store',
  slug: 'closed-store'
};

describe('POST /api/register (direct store sign-up)', () => {
  const app = create_express_app();
  let original;

  beforeEach(() => {
    original = process.env.ALLOW_DIRECT_STORE_SIGNUP;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.ALLOW_DIRECT_STORE_SIGNUP;
    else process.env.ALLOW_DIRECT_STORE_SIGNUP = original;
  });

  it('is closed by default', async () => {
    delete process.env.ALLOW_DIRECT_STORE_SIGNUP;
    const res = await request(app).post('/api/register').send(BODY);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/request a store/i);
  });

  it('stays closed for any value other than "true"', async () => {
    process.env.ALLOW_DIRECT_STORE_SIGNUP = 'yes';
    const res = await request(app).post('/api/register').send(BODY);
    expect(res.status).toBe(403);
  });
});
