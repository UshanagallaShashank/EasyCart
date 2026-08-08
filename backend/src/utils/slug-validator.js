// Checks a store slug against format rules and the reserved-word list.
import { RESERVED_SLUGS } from './reserved-slugs.js';

const SLUG_FORMAT = /^[a-z0-9-]{3,30}$/;

export function validate_slug(slug) {
  const has_valid_format = SLUG_FORMAT.test(slug);
  const is_reserved = RESERVED_SLUGS.includes(slug);

  if (!has_valid_format) {
    return { valid: false, message: 'Slug must be 3-30 characters: lowercase letters, numbers, and hyphens only' };
  }
  if (is_reserved) {
    return { valid: false, message: 'This slug is reserved and cannot be used' };
  }
  return { valid: true, message: null };
}
