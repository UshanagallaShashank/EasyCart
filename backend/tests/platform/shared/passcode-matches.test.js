// Unit tests for the constant-time admin passcode comparison.
import { describe, it, expect } from 'vitest';
import { passcode_matches } from '../../../src/platform/shared/passcode-matches.js';

describe('passcode_matches', () => {
  it('accepts the exact passcode', () => {
    expect(passcode_matches('s3cret-Code', 's3cret-Code')).toBe(true);
  });

  it('rejects a different or differently-sized passcode', () => {
    expect(passcode_matches('s3cret-code', 's3cret-Code')).toBe(false);
    expect(passcode_matches('s3cret', 's3cret-Code')).toBe(false);
  });

  it('rejects everything when no passcode is configured', () => {
    expect(passcode_matches('', '')).toBe(false);
    expect(passcode_matches('anything', '')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(passcode_matches(undefined, 's3cret-Code')).toBe(false);
    expect(passcode_matches(12345, '12345')).toBe(false);
  });
});
