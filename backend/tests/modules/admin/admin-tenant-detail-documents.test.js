import { describe, it, expect, beforeAll } from 'vitest';
import { connect_db } from '../../../src/platform/db/db.js';
import { get_tenant_detail } from '../../../src/modules/admin/services/admin-tenant-detail-service.js';

describe('Admin tenant detail documents', () => {
  beforeAll(async () => {
    await connect_db();
  });

  it('returns documents and business address for store Ravana', async () => {
    const detail = await get_tenant_detail('b2405559-7b3c-49dc-ba7c-16f6ca319b5f');
    expect(detail).toBeDefined();
    expect(detail.tenant.name).toBe('Ravana');
    expect(detail.business_address).toBe('qwawesdrtfy, sf, Telangana - 502278');
    expect(Array.isArray(detail.documents)).toBe(true);
    expect(detail.documents.length).toBe(2);
    expect(detail.documents[0].title).toBe('ID Proof');
    expect(detail.documents[0].url).toContain('https://');
    expect(detail.documents[1].title).toBe('Business Proof');
    expect(detail.documents[1].url).toContain('https://');
  });
});
