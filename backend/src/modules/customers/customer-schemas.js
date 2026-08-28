// Zod schema for customer registration (reuses auth's field-level rules).
import { z } from 'zod';
import { username_schema, email_schema, password_schema, phone_number_schema } from '../auth/auth-schemas.js';

export const customer_signup_schema = z.object({
  username: username_schema,
  email: email_schema,
  password: password_schema,
  phone_number: phone_number_schema
});

export function validate_customer_signup_input(data) {
  return customer_signup_schema.safeParse(data);
}
