// Hashes and verifies passwords using bcrypt.
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hash_password(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function check_password_matches(password, hash) {
  return bcrypt.compare(password, hash);
}
