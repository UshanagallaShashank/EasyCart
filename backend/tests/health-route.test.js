// Vitest suite verifying the backend health check API endpoint.
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server-main.js';
import { connect_db } from '../src/db/db.js';

describe('Health Check Route', () => {
  beforeAll(async () => {
    await connect_db();
  });

  it('responds with status 200 and ok payload when the database is connected', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
