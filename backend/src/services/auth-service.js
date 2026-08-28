import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { JWT_SECRET } from '../env.js';
import { AppError } from '../utils/app-error.js';
import { validate_signup_input } from '../utils/auth-schemas.js';
import { hash_password } from '../utils/hash.js';
import { find_user_by_email, save_user } from '../repositories/user-repository.js';

export async function create_user(payload) {
  const parsed = validate_signup_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }

  const email = String(payload.email).toLowerCase();
  const username = String(payload.username).trim();
  const phone_number = String(payload.phone_number).trim();

  const existing_user = await find_user_by_email(email);
  if (existing_user) {
    throw new AppError('User already exists', 409);
  }

  const password_hash = await hash_password(payload.password);
  const user = {
    id: randomUUID(),
    username,
    email,
    phone_number,
    password_hash,
    created_at: new Date().toISOString()
  };

  const saved_user = await save_user(user);
  const token = jwt.sign({ sub: saved_user.id || user.id, email: saved_user.email || email, username: saved_user.username || username }, JWT_SECRET, { expiresIn: '1h' });

  return {
    user: {
      id: saved_user.id || user.id,
      username: saved_user.username || username,
      email: saved_user.email || email,
      phone_number: saved_user.phone_number || phone_number
    },
    token
  };
}
