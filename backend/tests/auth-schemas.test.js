// Vitest unit test suite for auth input validation schemas.
import { describe, it, expect } from 'vitest';
import { validate_signup_input, validate_login_input } from '../src/utils/auth-schemas.js';

describe('Auth Validation Schemas', () => {
  it('passes valid signup and login input', () => {
    const valid = {
      username: 'valid_user',
      email: 'validuser@gmail.com',
      password: 'ValidPass123!',
      phone_number: '9876543210'
    };
    expect(validate_signup_input(valid).success).toBe(true);
    expect(validate_login_input({ email: valid.email, password: valid.password }).success).toBe(true);
  });

  it('rejects email not ending with @gmail.com', () => {
    const invalid_email = {
      username: 'valid_user',
      email: 'user@yahoo.com',
      password: 'ValidPass123!',
      phone_number: '9876543210'
    };
    const result = validate_signup_input(invalid_email);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('@gmail.com');
  });

  it('rejects password failing length or character rules', () => {
    expect(validate_signup_input({ username: 'u', email: 'u@gmail.com', password: 'Short1!', phone_number: '9876543210' }).success).toBe(false);
    expect(validate_signup_input({ username: 'valid_user', email: 'u@gmail.com', password: 'LongPassword1234567890!', phone_number: '9876543210' }).success).toBe(false);
    expect(validate_signup_input({ username: 'valid_user', email: 'u@gmail.com', password: 'lowercase123!', phone_number: '9876543210' }).success).toBe(false);
    expect(validate_signup_input({ username: 'valid_user', email: 'u@gmail.com', password: 'NoNumberHere!', phone_number: '9876543210' }).success).toBe(false);
    expect(validate_signup_input({ username: 'valid_user', email: 'u@gmail.com', password: 'NoSpecialChar123', phone_number: '9876543210' }).success).toBe(false);
    expect(validate_signup_input({ username: 'valid_user', email: 'u@gmail.com', password: 'With Space1!', phone_number: '9876543210' }).success).toBe(false);
  });
});
