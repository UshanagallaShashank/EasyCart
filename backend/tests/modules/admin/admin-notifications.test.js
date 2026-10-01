import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import { create_express_app } from '../../../src/server-main.js';
import { connect_db } from '../../../src/platform/db/db.js';
import { save_user } from '../../../src/modules/users/repositories/user-repository.js';
import { hash_password } from '../../../src/platform/shared/hash.js';
import { sign_token } from '../../../src/platform/shared/jwt.js';

async function create_admin_token() {
  const email = `admin-${randomUUID()}@example.com`;
  const password_hash = await hash_password('AdminPass123!');
  const admin_user = await save_user({
    id: randomUUID(),
    username: `adm_${randomUUID().slice(0, 6)}`,
    email,
    password_hash,
    role: 'platform_admin',
    tenant_id: null
  });
  return sign_token({
    sub: admin_user.id,
    email: admin_user.email,
    username: admin_user.username,
    role: admin_user.role,
    tenant_id: null
  });
}

describe('Admin notifications API', () => {
  const app = create_express_app();
  let adminToken;

  beforeAll(async () => {
    await connect_db();
    adminToken = await create_admin_token();
  });

  it('rejects unauthenticated requests to /api/admin/notifications', async () => {
    const res = await request(app).get('/api/admin/notifications');
    expect(res.status).toBe(401);
  });

  it('lists admin notifications with valid admin token', async () => {
    const res = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('notifications');
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body).toHaveProperty('unread_count');
    expect(typeof res.body.unread_count).toBe('number');
  });

  it('marks a specific notification as read', async () => {
    const listRes = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    if (listRes.body.notifications.length > 0) {
      const targetId = listRes.body.notifications[0].id;
      const readRes = await request(app)
        .patch(`/api/admin/notifications/${targetId}/read`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(readRes.status).toBe(200);
      expect(readRes.body.success).toBe(true);
    }
  });

  it('marks all notifications as read', async () => {
    const listRes = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    const ids = listRes.body.notifications.map((n) => n.id);
    const readAllRes = await request(app)
      .post('/api/admin/notifications/mark-all-read')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ids });

    expect(readAllRes.status).toBe(200);
    expect(readAllRes.body.success).toBe(true);
  });
});
