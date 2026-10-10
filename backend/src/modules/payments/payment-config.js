// The online-payment switch and the provider chosen from the environment settings.
import { ONLINE_PAYMENTS_ENABLED, PAYMENT_PROVIDER, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../../env.js';
import { AppError } from '../../platform/shared/app-error.js';
import { create_payment_provider } from './payment-providers.js';

export const payment_provider = create_payment_provider({ provider: PAYMENT_PROVIDER, key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

// What the app is allowed to know: is online payment on, and (for Razorpay) the public key the checkout needs. Never the secret.
export function public_payment_config() {
  if (!ONLINE_PAYMENTS_ENABLED) return { online_payments: false, payment_provider: null, razorpay_key_id: null };
  return {
    online_payments: true,
    payment_provider: payment_provider.name,
    razorpay_key_id: payment_provider.name === 'razorpay' ? RAZORPAY_KEY_ID : null
  };
}

// Called before an order is created, so a customer can never end up with an order that has no valid way to pay.
export function assert_payment_method_available(method) {
  if (method === 'online' && !ONLINE_PAYMENTS_ENABLED) {
    throw new AppError('Online payment is not available right now. Please pay in cash.', 400);
  }
}
