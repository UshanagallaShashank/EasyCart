// Checks log batching with a fake network. No database, no real log service.
import { describe, expect, it } from 'vitest';
import { create_log_sink } from '../../../src/platform/logging/remote-log-sink.js';

function fake_http() {
  const calls = [];
  return { calls, http: async (url, options) => { calls.push({ url, options }); return { ok: true }; } };
}

describe('remote log sink', () => {
  it('stays off and sends nothing without an address and token', async () => {
    const { calls, http } = fake_http();
    const sink = create_log_sink({ url: '', token: '', http });
    sink.add({ message: 'hello' });
    await sink.flush();
    expect(sink.enabled).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it('sends waiting entries as one JSON array with the bearer token', async () => {
    const { calls, http } = fake_http();
    const sink = create_log_sink({ url: 'https://logs.example', token: 'tok', http, flush_ms: 60_000 });
    sink.add({ message: 'one' });
    sink.add({ message: 'two' });
    await sink.flush();
    expect(calls).toHaveLength(1);
    expect(calls[0].options.headers.authorization).toBe('Bearer tok');
    expect(JSON.parse(calls[0].options.body).map((entry) => entry.message)).toEqual(['one', 'two']);
    expect(sink.waiting_count()).toBe(0);
  });

  it('never throws when the log service is down', async () => {
    const sink = create_log_sink({ url: 'https://logs.example', token: 'tok', http: async () => { throw new Error('down'); }, flush_ms: 60_000 });
    sink.add({ message: 'lost' });
    await expect(sink.flush()).resolves.toBeUndefined();
  });
});
