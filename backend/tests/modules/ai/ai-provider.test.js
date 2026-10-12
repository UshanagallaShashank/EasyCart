// Checks the optional AI writer with a fake network. No database, no real AI service, no environment file.
import { describe, expect, it } from 'vitest';
import { create_ai_writer } from '../../../src/modules/ai/ai-provider.js';

const reply = (text, ok = true) => async () => ({ ok, status: ok ? 200 : 429, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) });

describe('AI writer', () => {
  it('is off unless enabled, gemini and a key are all set', async () => {
    expect(create_ai_writer({ enabled: false, provider: 'gemini', api_key: 'k' }).name).toBe('none');
    expect(create_ai_writer({ enabled: true, provider: 'gemini', api_key: '' }).name).toBe('none');
    expect(create_ai_writer({ enabled: true, provider: 'none', api_key: 'k' }).name).toBe('none');
    expect(await create_ai_writer({ enabled: false }).write('s', 'p')).toBeNull();
  });

  it('sends the key in a header (not the address) and returns the text', async () => {
    const calls = [];
    const http = async (url, options) => { calls.push({ url, options }); return reply(' Fresh milk. ')(); };
    const writer = create_ai_writer({ enabled: true, provider: 'gemini', api_key: 'secret', model: 'gemini-flash-lite-latest', http });
    expect(await writer.write('system', 'prompt')).toBe('Fresh milk.');
    expect(calls[0].url).not.toContain('secret');
    expect(calls[0].options.headers['x-goog-api-key']).toBe('secret');
  });

  it('fails clearly when the service refuses', async () => {
    const writer = create_ai_writer({ enabled: true, provider: 'gemini', api_key: 'k', model: 'm', http: reply('', false) });
    await expect(writer.write('s', 'p')).rejects.toThrow('429');
  });
});
