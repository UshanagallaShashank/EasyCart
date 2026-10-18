// Checks rating maths and photo ownership. No database is used.
import { describe, expect, it } from 'vitest';
import { average, summarize_store_ratings, summarize_product_ratings, keep_order_items, is_own_photo } from '../../../src/modules/ratings/rating-math.js';

describe('average', () => {
  it('rounds to one decimal and is null with nothing to average', () => {
    expect(average([5, 4, 4])).toBe(4.3);
    expect(average([])).toBeNull();
  });
});

describe('summarize_store_ratings', () => {
  it('gives each store its own average and count', () => {
    const summaries = summarize_store_ratings([
      { tenant_id: 'a', store_stars: 5 }, { tenant_id: 'a', store_stars: 3 }, { tenant_id: 'b', store_stars: 4 }
    ]);
    expect(summaries.get('a')).toEqual({ average: 4, count: 2 });
    expect(summaries.get('b')).toEqual({ average: 4, count: 1 });
    expect(summaries.get('c')).toBeUndefined();
  });
});

describe('summarize_product_ratings', () => {
  it('adds up item stars across ratings and skips ratings without them', () => {
    const summaries = summarize_product_ratings([
      { item_stars: { milk: 5, rice: 3 } }, { item_stars: { milk: 4 } }, { item_stars: null }, {}
    ]);
    expect(summaries).toEqual({ milk: { average: 4.5, count: 2 }, rice: { average: 3, count: 1 } });
  });
});

describe('keep_order_items', () => {
  const items = [{ product_id: 'milk' }, { product_id: 'rice' }];

  it('keeps whole stars from 1 to 5 for products in the order', () => {
    expect(keep_order_items({ milk: 5, rice: 1 }, items)).toEqual({ milk: 5, rice: 1 });
  });

  it('drops products that were not in the order and stars out of range', () => {
    expect(keep_order_items({ milk: 6, rice: 0, soap: 5, milk2: 3 }, items)).toEqual({});
    expect(keep_order_items({ milk: 4.5 }, items)).toEqual({});
  });

  it('copes with nothing being sent', () => {
    expect(keep_order_items(undefined, items)).toEqual({});
  });
});

describe('is_own_photo', () => {
  const public_prefix = 'https://x.supabase.co/storage/v1/object/public/store-assets';

  it("accepts a photo in the customer's own folder", () => {
    expect(is_own_photo(`${public_prefix}/cust-1/review-o1-1.jpg`, { public_prefix, customer_id: 'cust-1' })).toBe(true);
  });

  it("refuses someone else's folder, another website or a look-alike folder name", () => {
    expect(is_own_photo(`${public_prefix}/cust-2/review-o1-1.jpg`, { public_prefix, customer_id: 'cust-1' })).toBe(false);
    expect(is_own_photo('https://evil.example/cust-1/x.jpg', { public_prefix, customer_id: 'cust-1' })).toBe(false);
    expect(is_own_photo(`${public_prefix}/cust-10/review.jpg`, { public_prefix, customer_id: 'cust-1' })).toBe(false);
  });

  it('refuses everything when storage is not set up', () => {
    expect(is_own_photo('anything', { public_prefix: '', customer_id: 'cust-1' })).toBe(false);
  });
});
