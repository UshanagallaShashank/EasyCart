import { describe, it, expect } from 'vitest';
import { sign_token, verify_token } from '../../../src/platform/shared/jwt.js';

describe('jwt sign/verify', () => {
  it('round-trips a payload', () => {
    const token = sign_token({ sub: 'user-1', role: 'tenant_owner' });
    const decoded = verify_token(token);
    expect(decoded.sub).toBe('user-1');
    expect(decoded.role).toBe('tenant_owner');
  });

  it('throws on a tampered token', () => {
    const token = sign_token({ sub: 'user-1' });
    expect(() => verify_token(token + 'tampered')).toThrow();
  });
});
