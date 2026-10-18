// Random one-time codes: 6 digits the customer gives the rider, 4 digits the store gives the rider at pickup.
import { randomInt } from 'node:crypto';
import { passcode_matches } from '../../../platform/shared/passcode-matches.js';

export const MAX_CODE_ATTEMPTS = 5;

export function create_delivery_code() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function create_pickup_code() {
  return String(randomInt(0, 10_000)).padStart(4, '0');
}

export function code_matches(provided, expected) {
  return passcode_matches(provided, expected);
}
