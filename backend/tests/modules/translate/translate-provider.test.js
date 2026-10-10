// Checks the translation rules with a fake network. No database, no real service, no environment file.
import { describe, expect, it } from 'vitest';
import { create_translator } from '../../../src/modules/translate/translate-provider.js';

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
