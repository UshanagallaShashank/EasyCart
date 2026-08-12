// Zod schemas for validating user email and password during authentication.
import { z } from 'zod';

export const email_schema = z
  .string()
  .email('Invalid email format')
  .refine((val) => val.toLowerCase().endsWith('@gmail.com'), {
    message: 'Email must end with @gmail.com'
  });

export const password_schema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(20, 'Password must not exceed 20 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
  .refine((val) => !val.includes(' '), {
    message: 'Password must not contain spaces'
  });

export const username_schema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must not exceed 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const phone_number_schema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, 'Phone number must be 10 to 15 digits');

export const signup_schema = z.object({
  username: username_schema,
  email: email_schema,
  password: password_schema,
  phone_number: phone_number_schema
});

export const login_schema = z.object({
  email: email_schema,
  password: password_schema
});

export function validate_signup_input(data) {
  return signup_schema.safeParse(data);
}

export function validate_login_input(data) {
  return login_schema.safeParse(data);
}
