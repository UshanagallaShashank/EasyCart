// Vitest suite verifying store slug format and reserved-word rules.
import { describe, it, expect } from 'vitest';
import { validate_slug } from '../src/utils/slug-validator.js';

describe('validate_slug', () => {
  it('accepts a valid slug', () => {
    expect(validate_slug('joes-cafe').valid).toBe(true);
  });

  it('rejects a badly formatted slug', () => {
    expect(validate_slug('Joes_Cafe!').valid).toBe(false);
  });

  it('rejects a reserved slug', () => {
    expect(validate_slug('admin').valid).toBe(false);
  });
});
