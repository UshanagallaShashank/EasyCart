// Vitest unit test suite for auth input validation schemas.
import { describe, it, expect } from 'vitest';
import { validate_signup_input, validate_login_input } from '../src/utils/auth-schemas.js';

describe('Auth Validation Schemas', () => {
  it('passes valid email and password input', () => {
    const valid = { email: 'validuser@gmail.com', password: 'ValidPass123!' };
    expect(validate_signup_input(valid).success).toBe(true);
    expect(validate_login_input(valid).success).toBe(true);
  });

  it('rejects email not ending with @gmail.com', () => {
    const invalid_email = { email: 'user@yahoo.com', password: 'ValidPass123!' };
    const result = validate_signup_input(invalid_email);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('@gmail.com');
  });

  it('rejects password failing length or character rules', () => {
    expect(validate_signup_input({ email: 'u@gmail.com', password: 'Short1!' }).success).toBe(false);
    expect(validate_signup_input({ email: 'u@gmail.com', password: 'LongPassword1234567890!' }).success).toBe(false);
    expect(validate_signup_input({ email: 'u@gmail.com', password: 'lowercase123!' }).success).toBe(false);
    expect(validate_signup_input({ email: 'u@gmail.com', password: 'NoNumberHere!' }).success).toBe(false);
    expect(validate_signup_input({ email: 'u@gmail.com', password: 'NoSpecialChar123' }).success).toBe(false);
    expect(validate_signup_input({ email: 'u@gmail.com', password: 'With Space1!' }).success).toBe(false);
  });
});
