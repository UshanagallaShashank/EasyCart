// Checks the translation rules with a fake network. No database, no real service, no environment file.
import { describe, expect, it } from 'vitest';
import { create_translator, protect_placeholders, to_google_text, from_google_text } from '../../../src/modules/translate/translate-provider.js';

function fakeHttp(reply) {
  const calls = [];
  const http = async (url, options) => {
    calls.push({ url, options });
    return reply;
  };
  return { http, calls };
}

const answer = (text) => ({ ok: true, json: async () => ({ content: [{ type: 'text', text }] }) });

describe('translator that is not set up', () => {
  it('hands the texts back unchanged when there is no provider or no key', async () => {
    expect(await create_translator({ provider: 'none' }).translate(['Milk'], 'te')).toEqual(['Milk']);
    expect(await create_translator({ provider: 'anthropic', api_key: '' }).translate(['Milk'], 'te')).toEqual(['Milk']);
    expect(create_translator({ provider: 'none' }).name).toBe('none');
  });
});

describe('anthropic translator', () => {
  it('sends the texts with the key and returns the translations in order', async () => {
    const { http, calls } = fakeHttp(answer('["పాలు","బియ్యం"]'));
    const translator = create_translator({ provider: 'anthropic', api_key: 'secret-key', model: 'some-model', http });
    const result = await translator.translate(['Milk', 'Rice'], 'te');

    expect(result).toEqual(['పాలు', 'బియ్యం']);
    expect(calls[0].url).toBe('https://api.anthropic.com/v1/messages');
    expect(calls[0].options.headers['x-api-key']).toBe('secret-key');
    const body = JSON.parse(calls[0].options.body);
    expect(body.model).toBe('some-model');
    expect(body.system).toContain('Telugu');
    expect(JSON.parse(body.messages[0].content)).toEqual(['Milk', 'Rice']);
    // The key goes in a header, never in the text sent to be translated.
    expect(calls[0].options.body).not.toContain('secret-key');
  });

  it('asks for Hindi when the language is hi', async () => {
    const { http, calls } = fakeHttp(answer('["दूध"]'));
    await create_translator({ provider: 'anthropic', api_key: 'k', model: 'm', http }).translate(['Milk'], 'hi');
    expect(JSON.parse(calls[0].options.body).system).toContain('Hindi');
  });

  it('refuses a reply with the wrong number of items', async () => {
    const { http } = fakeHttp(answer('["పాలు"]'));
    await expect(create_translator({ provider: 'anthropic', api_key: 'k', model: 'm', http }).translate(['Milk', 'Rice'], 'te')).rejects.toThrow('unexpected shape');
  });

  it('refuses a reply that is not a list of strings', async () => {
    const { http } = fakeHttp(answer('{"a":1}'));
    await expect(create_translator({ provider: 'anthropic', api_key: 'k', model: 'm', http }).translate(['Milk'], 'te')).rejects.toThrow();
    const second = fakeHttp(answer('["", "x"]'));
    await expect(create_translator({ provider: 'anthropic', api_key: 'k', model: 'm', http: second.http }).translate(['Milk', 'Rice'], 'te')).rejects.toThrow('unexpected shape');
  });

  it('reports a refused request', async () => {
    const { http } = fakeHttp({ ok: false, status: 401, json: async () => ({}) });
    await expect(create_translator({ provider: 'anthropic', api_key: 'k', model: 'm', http }).translate(['Milk'], 'te')).rejects.toThrow('401');
  });
});

describe('keeping placeholders for Google', () => {
  it('marks every {placeholder} as "do not translate"', () => {
    expect(protect_placeholders('{count} items in {shop}')).toBe('<span translate="no">{count}</span> items in <span translate="no">{shop}</span>');
    expect(protect_placeholders('No placeholders')).toBe('No placeholders');
    expect(protect_placeholders('Broken { brace')).toBe('Broken { brace');
  });

  it('keeps special characters safe on the way there and back', () => {
    const sent = to_google_text('Rice & dal <1kg> {n}');
    expect(sent).toBe('Rice &amp; dal &lt;1kg&gt; <span translate="no">{n}</span>');
    expect(from_google_text('బియ్యం &amp; పప్పు &lt;1kg&gt; <span translate="no">{n}</span>')).toBe('బియ్యం & పప్పు <1kg> {n}');
    expect(from_google_text('it&#39;s &quot;fresh&quot;')).toBe('it\'s "fresh"');
  });
});

describe('google translator', () => {
  const googleReply = (items) => ({ ok: true, json: async () => ({ data: { translations: items.map((translatedText) => ({ translatedText })) } }) });

  it('sends every text with the key and target language, and returns them in order with placeholders intact', async () => {
    const calls = [];
    const http = async (url, options) => { calls.push({ url, options }); return googleReply(['పాలు', '<span translate="no">{count}</span> వస్తువులు']); };
    const translator = create_translator({ provider: 'google', api_key: 'g-key', http });
    const result = await translator.translate(['Milk', '{count} items'], 'te');

    expect(result).toEqual(['పాలు', '{count} వస్తువులు']);
    expect(calls[0].url).toBe('https://translation.googleapis.com/language/translate/v2?key=g-key');
    const body = JSON.parse(calls[0].options.body);
    expect(body).toMatchObject({ target: 'te', format: 'html' });
    expect(body.q).toEqual(['Milk', '<span translate="no">{count}</span> items']);
    // No source language is sent, so Google works out the original language by itself.
    expect(body.source).toBeUndefined();
  });

  it('refuses a reply with the wrong number of items', async () => {
    const translator = create_translator({ provider: 'google', api_key: 'k', http: async () => googleReply(['one']) });
    await expect(translator.translate(['Milk', 'Rice'], 'hi')).rejects.toThrow('unexpected shape');
  });

  it('reports a refused request', async () => {
    const translator = create_translator({ provider: 'google', api_key: 'k', http: async () => ({ ok: false, status: 403, json: async () => ({}) }) });
    await expect(translator.translate(['Milk'], 'te')).rejects.toThrow('403');
  });

  it('is off without a key', async () => {
    expect(create_translator({ provider: 'google', api_key: '' }).name).toBe('none');
  });
});

