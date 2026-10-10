// The companies (or the test stand-in) that take an online payment. This file never reads the environment,
// so it can be tested with fake settings and a fake network.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AppError } from '../../platform/shared/app-error.js';

// Money goes to the payment company in paise (1 rupee = 100 paise), as whole numbers.
export function to_paise(rupees) {
  return Math.round(Number(rupees) * 100);
}

// A test payment that takes no real money. The app shows a "Pay (test)" button and sends back "approve".
function create_mock_provider() {
  return {
    name: 'mock',
    async start(order) {
      return { provider: 'mock', amount: to_paise(order.total), currency: 'INR', reference: `mock_${order.id}` };
    },
    async verify(order, input) {
      if (input?.approve !== true || input?.reference !== `mock_${order.id}`) {
        throw new AppError('The test payment was not approved', 400);
      }
      return { reference: `mock_${order.id}` };
    },
    // A test refund: nothing moves, but it behaves like a real one.
    async refund({ amount }) {
      return { refund_id: `mock_refund_${amount}_${Date.now()}` };
    }
  };
}

function create_razorpay_provider({ key_id, key_secret, http }) {
  const authorization = `Basic ${Buffer.from(`${key_id}:${key_secret}`).toString('base64')}`;

  async function call(path, options = {}) {
    let response;
    try {
      response = await http(`https://api.razorpay.com/v1${path}`, { ...options, headers: { Authorization: authorization, 'Content-Type': 'application/json' } });
    } catch {
      throw new AppError('The payment service could not be reached. Please try again.', 502);
    }
    if (!response.ok) throw new AppError('The payment service refused the request', 502);
    return response.json();
  }

  return {
    name: 'razorpay',
    async start(order) {
      // The receipt is our own order id. verify() checks it later, so a payment made for a cheap order can never be used on a dearer one.
      const created = await call('/orders', { method: 'POST', body: JSON.stringify({ amount: to_paise(order.total), currency: 'INR', receipt: order.id }) });
      return { provider: 'razorpay', key_id, razorpay_order_id: created.id, amount: created.amount, currency: created.currency };
    },
    async verify(order, input) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input ?? {};
      if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every((value) => typeof value === 'string' && value.length > 0)) {
        throw new AppError('The payment details are incomplete', 400);
      }

      const expected = createHmac('sha256', key_secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
      const given = Buffer.from(razorpay_signature);
      const wanted = Buffer.from(expected);
      if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
        throw new AppError('The payment could not be verified', 400);
      }

      // The signature proves a payment happened. Asking Razorpay for the order proves it was for THIS order and amount.
      const paid_order = await call(`/orders/${encodeURIComponent(razorpay_order_id)}`);
      if (paid_order.receipt !== order.id || paid_order.amount !== to_paise(order.total) || paid_order.status !== 'paid') {
        throw new AppError('The payment does not match this order', 400);
      }
      return { reference: razorpay_payment_id };
    },
    // Sends `amount` paise of this payment back to the customer's card or UPI.
    async refund({ reference, amount }) {
      const done = await call(`/payments/${encodeURIComponent(reference)}/refund`, { method: 'POST', body: JSON.stringify({ amount }) });
      return { refund_id: done.id };
    }
  };
}

export function create_payment_provider({ provider, key_id, key_secret, http = fetch }) {
  return provider === 'razorpay' ? create_razorpay_provider({ key_id, key_secret, http }) : create_mock_provider();
}
