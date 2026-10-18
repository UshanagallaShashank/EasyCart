// Checks the rating rules only. No database is used.
import { describe, expect, it } from 'vitest';
import { validate_rating_input } from '../../../src/modules/ratings/rating-schemas.js';

describe('validate_rating_input', () => {
  it('accepts store stars alone', () => {
    expect(validate_rating_input({ store_stars: 5 }).success).toBe(true);
  });

  it('accepts store stars, delivery stars and a comment', () => {
    const result = validate_rating_input({ store_stars: 4, delivery_stars: 3, comment: '  Fresh and fast  ' });
    expect(result.success).toBe(true);
    expect(result.data.comment).toBe('Fresh and fast');
  });

  it('rejects stars outside 1 to 5', () => {
    expect(validate_rating_input({ store_stars: 0 }).success).toBe(false);
    expect(validate_rating_input({ store_stars: 6 }).success).toBe(false);
  });

  it('rejects half stars', () => {
    expect(validate_rating_input({ store_stars: 3.5 }).success).toBe(false);
  });

  it('rejects a missing store rating', () => {
    expect(validate_rating_input({ delivery_stars: 5 }).success).toBe(false);
  });

  it('rejects a comment over 300 characters', () => {
    expect(validate_rating_input({ store_stars: 5, comment: 'x'.repeat(301) }).success).toBe(false);
  });
});
