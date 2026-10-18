// Signs and verifies JWTs for authenticated requests.
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../env.js';

export function sign_token(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function verify_token(token) {
  return jwt.verify(token, JWT_SECRET);
}
