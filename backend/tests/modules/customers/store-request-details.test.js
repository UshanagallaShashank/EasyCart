import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';

// A tiny valid PNG as a data URL, standing in for an uploaded document.
const PNG_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function register_customer(app) {
  const res = await request(app).post('/api/customers/register').send({
    username: `cust_${randomUUID().slice(0, 8)}`,
    email: `cust-${randomUUID()}@example.com`,
    password: 'ExamplePass123!',
    phone_number: '9876543210'
  });
  return res.body.token;
}

function valid_body(overrides = {}) {
  return {
    store_name: 'Details Store',
    slug: `details-${randomUUID().slice(0, 8)}`,
    business_address: { line1: '12 Market Road', landmark: '', city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
    id_proof: PNG_DATA_URL,
    business_proof: PNG_DATA_URL,
    ...overrides
  };
}

describe('Store request details', () => {
  const app = create_express_app();

  beforeAll(async () => {
    await connect_db();
  });

  it('rejects a request with no business address', async () => {
    const token = await register_customer(app);
    const res = await request(app).post('/api/customers/store-request').set('Authorization', `Bearer ${token}`).send(valid_body({ business_address: undefined }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/address/i);
  });

  it('rejects a PIN code that is not 6 digits', async () => {
    const token = await register_customer(app);
    const bad_address = { line1: '12 Market Road', city: 'Hyderabad', state: 'Telangana', pincode: '50A001' };
    const res = await request(app).post('/api/customers/store-request').set('Authorization', `Bearer ${token}`).send(valid_body({ business_address: bad_address }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/PIN code/);
  });

  it('rejects an address with no city', async () => {
    const token = await register_customer(app);
    const bad_address = { line1: '12 Market Road', city: '', state: 'Telangana', pincode: '500001' };
    const res = await request(app).post('/api/customers/store-request').set('Authorization', `Bearer ${token}`).send(valid_body({ business_address: bad_address }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/City/);
  });

  it('rejects a request with no ID proof', async () => {
    const token = await register_customer(app);
    const res = await request(app).post('/api/customers/store-request').set('Authorization', `Bearer ${token}`).send(valid_body({ id_proof: undefined }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/ID proof/);
  });

  it('rejects a request with no business proof', async () => {
    const token = await register_customer(app);
    const res = await request(app).post('/api/customers/store-request').set('Authorization', `Bearer ${token}`).send(valid_body({ business_proof: undefined }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Business proof/);
  });

  it('rejects a document that is not a PDF or image', async () => {
    const token = await register_customer(app);
    const text_file = `data:text/plain;base64,${Buffer.from('hello').toString('base64')}`;
    const res = await request(app).post('/api/customers/store-request').set('Authorization', `Bearer ${token}`).send(valid_body({ id_proof: text_file }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/PDF, JPG, PNG or WEBP/);
  });
});
