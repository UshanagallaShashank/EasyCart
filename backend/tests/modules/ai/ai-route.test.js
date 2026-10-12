// Checks the optional-features routes over HTTP. Neither touches the database.
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/server-main.js';

describe('features and AI routes', () => {
  it('says whether AI help is on', async () => {
    const response = await request(app).get('/api/features');
    expect(response.status).toBe(200);
    expect(typeof response.body.ai).toBe('boolean');
  });

  it('refuses the AI helper without a signed-in store owner', async () => {
    const response = await request(app).post('/api/ai/product-description').send({ name: 'Milk' });
    expect(response.status).toBe(401);
  });
});
