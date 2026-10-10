// Admin sign-up requests that must be refused before any database work happens.
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';

const VALID = { username: 'root_admin', email: 'root@example.com', password: 'AdminPass123!', passcode: 'right-passcode' };

describe('POST /api/admin/register guards', () => {
  const app = create_express_app();

  // Start every test with no passcode, whatever the machine's .env file sets.
  beforeEach(() => {
    delete process.env.ADMIN_SIGNUP_PASSCODE;
  });

  afterEach(() => {
    delete process.env.ADMIN_SIGNUP_PASSCODE;
  });

  it('is disabled when ADMIN_SIGNUP_PASSCODE is not set', async () => {
    const response = await request(app).post('/api/admin/register').send(VALID);
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Admin sign-up is disabled');
  });

  it('rejects a wrong passcode', async () => {
    process.env.ADMIN_SIGNUP_PASSCODE = 'right-passcode';
    const response = await request(app).post('/api/admin/register').send({ ...VALID, passcode: 'wrong-passcode' });
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Invalid admin passcode');
  });

  it('rejects a missing passcode and invalid fields with 400', async () => {
    process.env.ADMIN_SIGNUP_PASSCODE = 'right-passcode';
    const response = await request(app).post('/api/admin/register').send({ username: 'x', email: 'nope', password: 'short' });
    expect(response.status).toBe(400);
  });
});
