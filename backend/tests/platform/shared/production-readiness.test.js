import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { find_production_env_problems, assert_production_env } from '../../../src/env.js';
import { create_express_app, is_origin_allowed } from '../../../src/server-main.js';

const GOOD_ENV = {
  JWT_SECRET: 'a-long-random-secret-value-for-production-1234',
  CORS_ORIGIN: 'https://shop.example.com',
  DB_PROVIDER: 'supabase',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-key'
};

describe('Production environment check', () => {
  it('accepts a complete, safe set of settings', () => {
    expect(find_production_env_problems(GOOD_ENV)).toEqual([]);
  });

  it('flags a missing JWT secret', () => {
    const problems = find_production_env_problems({ ...GOOD_ENV, JWT_SECRET: '' });
    expect(problems.join(' ')).toMatch(/JWT_SECRET/);
  });

  it('flags the built-in development JWT secret', () => {
    const problems = find_production_env_problems({ ...GOOD_ENV, JWT_SECRET: 'easycart_dev_secret_key_12345' });
    expect(problems.join(' ')).toMatch(/JWT_SECRET/);
  });

  it('flags a JWT secret that is too short', () => {
    const problems = find_production_env_problems({ ...GOOD_ENV, JWT_SECRET: 'short' });
    expect(problems.join(' ')).toMatch(/32 characters/);
  });

  it('flags missing CORS origins', () => {
    const problems = find_production_env_problems({ ...GOOD_ENV, CORS_ORIGIN: '' });
    expect(problems.join(' ')).toMatch(/CORS_ORIGIN/);
  });

  it('flags missing Supabase settings when Supabase is the database', () => {
    const problems = find_production_env_problems({ ...GOOD_ENV, SUPABASE_URL: '' });
    expect(problems.join(' ')).toMatch(/SUPABASE_URL/);
  });

  it('flags a missing Mongo address when Mongo is the database', () => {
    const problems = find_production_env_problems({ ...GOOD_ENV, DB_PROVIDER: 'mongodb' });
    expect(problems.join(' ')).toMatch(/MONGODB_URI/);
  });

  it('refuses to start with unsafe settings, listing every problem', () => {
    expect(() => assert_production_env({ DB_PROVIDER: 'supabase' })).toThrow(/JWT_SECRET[\s\S]*CORS_ORIGIN/);
  });
});

describe('CORS origins', () => {
  const allowed = ['https://shop.example.com'];

  it('allows a listed website', () => {
    expect(is_origin_allowed('https://shop.example.com', allowed)).toBe(true);
  });

  it('refuses a website that is not listed', () => {
    expect(is_origin_allowed('https://evil.example.com', allowed)).toBe(false);
  });

  it('allows calls that have no origin, like curl or server to server', () => {
    expect(is_origin_allowed(undefined, allowed)).toBe(true);
  });

  it('allows every website when the list is *', () => {
    expect(is_origin_allowed('https://anything.example.com', ['*'])).toBe(true);
  });

  it('allows everyone when no list is set (local development)', () => {
    expect(is_origin_allowed('http://localhost:5173', [])).toBe(true);
  });
});

describe('Server hardening', () => {
  const app = create_express_app();

  it('sends security headers and hides the framework name', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('answers an unknown API address with a JSON 404', async () => {
    const res = await request(app).get('/api/this-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });

  it('answers malformed JSON with a 400, not a 500', async () => {
    const res = await request(app).post('/api/login').set('Content-Type', 'application/json').send('{not json');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Request body is not valid JSON');
  });

  it('answers an oversized upload with a 413, not a 500', async () => {
    const huge = JSON.stringify({ file: 'x'.repeat(11 * 1024 * 1024) });
    const res = await request(app).post('/api/login').set('Content-Type', 'application/json').send(huge);
    expect(res.status).toBe(413);
    expect(res.body.error).toBe('The upload is too large');
  });
});
