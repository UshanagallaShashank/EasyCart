// Unit tests for reading every Supabase row in pages.
import { describe, it, expect } from 'vitest';
import { select_all_rows } from '../../../src/platform/shared/select-all-rows.js';

function fake_query(total, ranges) {
  return () => ({
    range: async (from, to) => {
      ranges.push([from, to]);
      return { data: Array.from({ length: Math.max(0, Math.min(total, to + 1) - from) }, (_, i) => from + i), error: null };
    }
  });
}

describe('select_all_rows', () => {
  it('keeps requesting pages until a short page comes back', async () => {
    const ranges = [];
    const rows = await select_all_rows(fake_query(25, ranges), 10);
    expect(rows).toHaveLength(25);
    expect(ranges).toEqual([[0, 9], [10, 19], [20, 29]]);
  });

  it('makes one extra request when the total is an exact multiple of the page size', async () => {
    const ranges = [];
    expect(await select_all_rows(fake_query(20, ranges), 10)).toHaveLength(20);
    expect(ranges).toHaveLength(3);
  });

  it('throws the database error', async () => {
    const failing = () => ({ range: async () => ({ data: null, error: new Error('boom') }) });
    await expect(select_all_rows(failing, 10)).rejects.toThrow('boom');
  });
});
