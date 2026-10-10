// Compares a submitted passcode to the expected one in constant time, so timing reveals nothing.
import { createHash, timingSafeEqual } from 'node:crypto';

function digest_text(text) {
  return createHash('sha256').update(String(text)).digest();
}

export function passcode_matches(provided, expected) {
  if (!expected || typeof provided !== 'string') return false;
  return timingSafeEqual(digest_text(provided), digest_text(expected));
}
