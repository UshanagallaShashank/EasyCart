import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { authenticate } from '../../../src/platform/shared/authenticate.js';
import { error_handler } from '../../../src/platform/shared/error-handler.js';
import { sign_token } from '../../../src/platform/shared/jwt.js';

function build_app() {
  const app = express();
  app.get('/protected', authenticate, (req, res) => res.json({ user: req.user }));
  app.use(error_handler);
  return app;
}

describe('authenticate middleware', () => {
  it('rejects a request with no token', async () => {
    const response = await request(build_app()).get('/protected');
    expect(response.status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const response = await request(build_app()).get('/protected').set('Authorization', 'Bearer not-a-real-token');
    expect(response.status).toBe(401);
  });

  it('accepts a valid token and attaches req.user', async () => {
    const token = sign_token({ sub: 'user-1', email: 'a@b.com', username: 'a', role: 'tenant_owner', tenant_id: 'tenant-1' });
    const response = await request(build_app()).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe('user-1');
    expect(response.body.user.role).toBe('tenant_owner');
  });
});
