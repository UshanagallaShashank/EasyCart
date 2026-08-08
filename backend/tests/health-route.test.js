// Vitest suite verifying the backend health check API endpoint.
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server-main.js';

describe('Health Check Route', () => {
  it('responds with status 200 and ok payload', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
