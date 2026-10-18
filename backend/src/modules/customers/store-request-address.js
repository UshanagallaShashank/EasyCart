// Checks the business address sent with a store request and joins it into one line of text for the admin to read.
import { AppError } from '../../platform/shared/app-error.js';

function clean(value) {
  return String(value || '').trim();
}

function is_all_digits(text) {
  return [...text].every((character) => character >= '0' && character <= '9');
}

function check_length(text, label, min, max) {
  if (text.length < min || text.length > max) {
    throw new AppError(`${label} must be between ${min} and ${max} characters`, 400);
  }
}

export function build_business_address(input) {
  const address = input || {};
  const line1 = clean(address.line1);
  const landmark = clean(address.landmark);
  const city = clean(address.city);
  const state = clean(address.state);
  const pincode = clean(address.pincode);

  check_length(line1, 'Address line', 5, 150);
  check_length(city, 'City', 2, 60);
  check_length(state, 'State', 2, 60);

  if (landmark.length > 100) {
    throw new AppError('Landmark must be 100 characters or fewer', 400);
  }
  if (pincode.length !== 6 || !is_all_digits(pincode)) {
    throw new AppError('PIN code must be 6 digits', 400);
  }

  const landmark_part = landmark ? `, near ${landmark}` : '';
  return `${line1}${landmark_part}, ${city}, ${state} - ${pincode}`;
}
