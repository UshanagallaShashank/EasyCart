// Checks the payment rules with a fake network. No database, no real money, no environment file.
import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { create_payment_provider, to_paise } from '../../../src/modules/payments/payment-providers.js';

const order = { id: 'order-1', total: 320.5 };
const secret = 'test_secret';

describe('to_paise', () => {
  it('turns rupees into whole paise', () => {
    expect(to_paise(320.5)).toBe(32050);
    expect(to_paise(0.1 + 0.2)).toBe(30);
  });
});

describe('mock provider', () => {
  const provider = create_payment_provider({ provider: 'mock' });

  it('starts a test payment for the order amount', async () => {
    const started = await provider.start(order);
    expect(started).toMatchObject({ provider: 'mock', amount: 32050, reference: 'mock_order-1' });
  });

  it('accepts an approved test payment', async () => {
    await expect(provider.verify(order, { approve: true, reference: 'mock_order-1' })).resolves.toEqual({ reference: 'mock_order-1' });
  });

  it('refuses a payment that is not approved or is for another order', async () => {
    await expect(provider.verify(order, { approve: false, reference: 'mock_order-1' })).rejects.toThrow('not approved');
    await expect(provider.verify(order, { approve: true, reference: 'mock_other' })).rejects.toThrow('not approved');
    await expect(provider.verify(order, undefined)).rejects.toThrow('not approved');
  });
});

describe('razorpay provider', () => {
  function sign(razorpay_order_id, razorpay_payment_id) {
    return createHmac('sha256', secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  }

  // A fake network that answers like Razorpay and remembers what it was asked.
  function fakeHttp(replies) {
    const calls = [];
    const http = async (url, options) => {
      calls.push({ url, options });
      const reply = replies.shift();
      if (reply instanceof Error) throw reply;
      return { ok: reply.ok ?? true, json: async () => reply.body };
    };
    return { http, calls };
  }

  it('creates a Razorpay order for the right amount, with our order id as the receipt', async () => {
    const { http, calls } = fakeHttp([{ body: { id: 'rzp_order_1', amount: 32050, currency: 'INR' } }]);
    const provider = create_payment_provider({ provider: 'razorpay', key_id: 'rzp_test_key', key_secret: secret, http });
    const started = await provider.start(order);

    expect(started).toEqual({ provider: 'razorpay', key_id: 'rzp_test_key', razorpay_order_id: 'rzp_order_1', amount: 32050, currency: 'INR' });
    expect(calls[0].url).toBe('https://api.razorpay.com/v1/orders');
    expect(JSON.parse(calls[0].options.body)).toEqual({ amount: 32050, currency: 'INR', receipt: 'order-1' });
    expect(JSON.stringify(started)).not.toContain(secret);
  });

  it('accepts a good signature for the right order, amount and a paid status', async () => {
    const { http } = fakeHttp([{ body: { receipt: 'order-1', amount: 32050, status: 'paid' } }]);
    const provider = create_payment_provider({ provider: 'razorpay', key_id: 'k', key_secret: secret, http });
    const result = await provider.verify(order, { razorpay_order_id: 'rzp_order_1', razorpay_payment_id: 'pay_1', razorpay_signature: sign('rzp_order_1', 'pay_1') });
    expect(result).toEqual({ reference: 'pay_1' });
  });

  it('refuses a forged signature without asking Razorpay anything', async () => {
    const { http, calls } = fakeHttp([]);
    const provider = create_payment_provider({ provider: 'razorpay', key_id: 'k', key_secret: secret, http });
    await expect(provider.verify(order, { razorpay_order_id: 'rzp_order_1', razorpay_payment_id: 'pay_1', razorpay_signature: 'f'.repeat(64) })).rejects.toThrow('could not be verified');
    expect(calls).toHaveLength(0);
  });

  it('refuses incomplete payment details', async () => {
    const provider = create_payment_provider({ provider: 'razorpay', key_id: 'k', key_secret: secret, http: async () => ({}) });
    await expect(provider.verify(order, { razorpay_order_id: 'x' })).rejects.toThrow('incomplete');
  });

  it('refuses a real payment that was made for a different order id', async () => {
    const { http } = fakeHttp([{ body: { receipt: 'some-cheaper-order', amount: 32050, status: 'paid' } }]);
    const provider = create_payment_provider({ provider: 'razorpay', key_id: 'k', key_secret: secret, http });
    await expect(provider.verify(order, { razorpay_order_id: 'rzp_order_1', razorpay_payment_id: 'pay_1', razorpay_signature: sign('rzp_order_1', 'pay_1') })).rejects.toThrow('does not match');
  });

  it('refuses a payment for a smaller amount', async () => {
    const { http } = fakeHttp([{ body: { receipt: 'order-1', amount: 100, status: 'paid' } }]);
    const provider = create_payment_provider({ provider: 'razorpay', key_id: 'k', key_secret: secret, http });
    await expect(provider.verify(order, { razorpay_order_id: 'rzp_order_1', razorpay_payment_id: 'pay_1', razorpay_signature: sign('rzp_order_1', 'pay_1') })).rejects.toThrow('does not match');
  });

  it('refuses an order that Razorpay says is not paid yet', async () => {
    const { http } = fakeHttp([{ body: { receipt: 'order-1', amount: 32050, status: 'created' } }]);
    const provider = create_payment_provider({ provider: 'razorpay', key_id: 'k', key_secret: secret, http });
    await expect(provider.verify(order, { razorpay_order_id: 'rzp_order_1', razorpay_payment_id: 'pay_1', razorpay_signature: sign('rzp_order_1', 'pay_1') })).rejects.toThrow('does not match');
  });

  it('reports an unreachable payment service clearly', async () => {
    const { http } = fakeHttp([new Error('network down')]);
    const provider = create_payment_provider({ provider: 'razorpay', key_id: 'k', key_secret: secret, http });
    await expect(provider.start(order)).rejects.toThrow('could not be reached');
  });
});
