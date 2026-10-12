// A fake backend for the UX tests. Each test says which answers it wants, keyed like "GET /stores/*/products"
// (a * matches one part of the path). Anything else gets an empty list.
// `goDown()` makes the fake server stop answering, and `comeBack()` brings it back, to test the downtime banner.
import type { Page, Route } from '@playwright/test';

export const API = 'http://api.e2e.test/api';

export type Answer = { status?: number; body: unknown } | ((route: Route) => Promise<void> | void);
export type Answers = Record<string, Answer>;

function matches(pattern: string, key: string) {
  const want = pattern.split('/');
  const got = key.split('/');
  if (want.length !== got.length) return false;
  return want.every((part, index) => part === '*' || part === got[index]);
}

function findAnswer(answers: Answers, key: string): Answer | undefined {
  if (answers[key]) return answers[key];
  const pattern = Object.keys(answers).find((candidate) => candidate.includes('*') && matches(candidate, key));
  return pattern ? answers[pattern] : undefined;
}

export async function mockApi(page: Page, answers: Answers = {}) {
  let down = false;
  const all = { ...DEFAULTS, ...answers };
  await page.route(`${API}/**`, async (route) => {
    if (down) return route.abort('connectionrefused');
    const url = new URL(route.request().url());
    const key = `${route.request().method()} ${url.pathname.replace('/api', '')}`;
    const answer = findAnswer(all, key) ?? { body: [] };
    if (typeof answer === 'function') return answer(route);
    return route.fulfill({ status: answer.status ?? 200, contentType: 'application/json', body: JSON.stringify(answer.body) });
  });
  return { goDown: () => { down = true; }, comeBack: () => { down = false; } };
}

const DEFAULTS: Answers = {
  'GET /health': { body: { status: 'ok', timestamp: new Date().toISOString(), started_at: new Date().toISOString(), uptime_seconds: 3600 } },
  'GET /features': { body: { ai: false } },
  'GET /themes': { body: { catalog: ['sky'], enabled: ['sky'], default: 'sky' } },
  'POST /translate/public': { body: { translations: [], enabled: false } },
  'POST /live/ticket': { status: 404, body: { error: 'Live updates are off in tests' } }
};
