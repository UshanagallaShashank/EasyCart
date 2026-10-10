import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';
import { hash_password } from '../../../src/platform/shared/hash.js';
import { save_user } from '../../../src/modules/users/repositories/user-repository.js';
import { sign_token } from '../../../src/platform/shared/jwt.js';

describe('Admin User Profile & Role Management', () => {
  const app = create_express_app();
  let adminToken;
  let adminUser;
  let customerUser;
  let customerToken;
  let targetUser;

  beforeAll(async () => {
    await connect_db();

    // 1. Create a platform admin
    adminUser = await save_user({
      id: randomUUID(),
      username: `adm_${randomUUID().slice(0, 8)}`,
      email: `admin-${randomUUID()}@example.com`,
      phone_number: '9876543210',
      password_hash: await hash_password('AdminPass123!'),
      role: 'platform_admin',
      tenant_id: null
    });
    adminToken = sign_token({
      sub: adminUser.id,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role,
      tenant_id: null
    });

    // 2. Create another admin to allow role demotion testing safely
    await save_user({
      id: randomUUID(),
      username: `adm2_${randomUUID().slice(0, 8)}`,
      email: `admin2-${randomUUID()}@example.com`,
      phone_number: '9876543211',
      password_hash: await hash_password('AdminPass123!'),
      role: 'platform_admin',
      tenant_id: null
    });

    // 3. Create a regular customer
    customerUser = await save_user({
      id: randomUUID(),
      username: `cust_${randomUUID().slice(0, 8)}`,
      email: `cust-${randomUUID()}@example.com`,
      phone_number: '9876543212',
      password_hash: await hash_password('CustPass123!'),
      role: 'customer',
      tenant_id: null
    });
    customerToken = sign_token({
      sub: customerUser.id,
      email: customerUser.email,
      username: customerUser.username,
      role: customerUser.role,
      tenant_id: null
    });

    // 4. Create a target user to manage role and status on
    targetUser = await save_user({
      id: randomUUID(),
      username: `target_${randomUUID().slice(0, 8)}`,
      email: `target-${randomUUID()}@example.com`,
      phone_number: '9876543213',
      password_hash: await hash_password('TargetPass123!'),
      role: 'customer',
      status: 'active',
      tenant_id: null
    });
  });

  it('rejects non-admin callers from viewing user profile via admin route', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin to view a specific user profile including status and last_active_at', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe(targetUser.id);
    expect(res.body.user.username).toBe(targetUser.username);
    expect(res.body.user.email).toBe(targetUser.email);
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user.status).toBe('active');
    expect(res.body.user.last_active_at).toBeDefined();
  });

  it('returns 404 for a non-existent user profile', async () => {
    const res = await request(app)
      .get('/api/admin/users/non-existent-user-id')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('refuses admin modification of user personal details (username, email, phone)', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'new_hacked_name'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Admins cannot modify personal user details/);
  });

  it('allows an admin to change user role to tenant_owner', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        role: 'tenant_owner'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('tenant_owner');
  });

  it('allows an admin to change user status from active to inactive', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'inactive'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe('inactive');
  });

  it('blocks an inactive customer from logging in', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: targetUser.email,
        password: 'TargetPass123!'
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/deactivated/i);
  });

  it('allows an admin to reactivate user status back to active', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'active'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe('active');
  });

  it('allows an admin to change user role to platform_admin', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        role: 'platform_admin'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('platform_admin');
  });

  it('allows an admin to demote user role back to customer', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        role: 'customer'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('customer');
  });

  it('rejects invalid roles with 400', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        role: 'super_god_mode'
      });

    expect(res.status).toBe(400);
  });

  it('rejects invalid status with 400', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'banned_forever'
      });

    expect(res.status).toBe(400);
  });

  it('prevents an admin from deactivating their own account', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${adminUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'inactive'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cannot deactivate your own admin account/i);
  });

  it('allows any authenticated user to view their own profile via /api/profile', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(customerUser.id);
    expect(res.body.user.username).toBe(customerUser.username);
  });

  it('allows an authenticated user to update their own profile via /api/profile', async () => {
    const updatedPhone = '9123456780';
    const res = await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        phone_number: updatedPhone
      });

    expect(res.status).toBe(200);
    expect(res.body.user.phone_number).toBe(updatedPhone);
  });
});
