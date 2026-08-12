import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../env.js';

const SALT_ROUNDS = 12;

function pepperPassword(password) {
  return password + JWT_SECRET;
}

export async function hashPassword(password) {
  return bcrypt.hashSync(pepperPassword(password), SALT_ROUNDS);
}

export async function checkPasswordMatches(password, hash) {
  return bcrypt.compareSync(pepperPassword(password), hash);
}
