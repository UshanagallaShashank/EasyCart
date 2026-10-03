// Signs and verifies JWTs for authenticated requests.
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../env.js';

// How long a sign-in lasts before the person has to sign in again: a full working day for riders and store owners.
export const LOGIN_LIFETIME_HOURS = 12;

export function sign_token(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${LOGIN_LIFETIME_HOURS}h` });
}

export function verify_token(token) {
  return jwt.verify(token, JWT_SECRET);
}
