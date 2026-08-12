// Vitest unit test suite for auth input validation schemas.
import { describe, it, expect } from 'vitest';
import { validate_signup_input, validate_login_input } from '../src/utils/auth-schemas.js';

describe('Auth Validation Schemas', () => {
  const build_valid_user = () => ({
    username: 'example_user_01',
    email: 'example.user.01@gmail.com',
    password: 'ExamplePass123!',
    phone_number: '9876543210'
  });

  it('passes valid signup and login input', () => {
    const valid = build_valid_user();
    expect(validate_signup_input(valid).success).toBe(true);
    expect(validate_login_input({ email: valid.email, password: valid.password }).success).toBe(true);
  });

  it('rejects email not ending with @gmail.com', () => {
    const invalid_email = {
      ...build_valid_user(),
      email: 'user@yahoo.com'
    };
    const result = validate_signup_input(invalid_email);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('@gmail.com');
  });

  it('rejects password failing length or character rules', () => {
    expect(validate_signup_input({ ...build_valid_user(), username: 'u', password: 'Short1!' }).success).toBe(false);
    expect(validate_signup_input({ ...build_valid_user(), password: 'ExampleLongPassword1234567890!' }).success).toBe(false);
    expect(validate_signup_input({ ...build_valid_user(), password: 'examplepass123!' }).success).toBe(false);
    expect(validate_signup_input({ ...build_valid_user(), password: 'NoNumberHere!' }).success).toBe(false);
    expect(validate_signup_input({ ...build_valid_user(), password: 'NoSpecialChar123' }).success).toBe(false);
    expect(validate_signup_input({ ...build_valid_user(), password: 'With Space1!' }).success).toBe(false);
  });
});
