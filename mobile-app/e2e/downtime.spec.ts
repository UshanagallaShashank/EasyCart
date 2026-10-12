// Downtime: when the server stops answering, a banner appears with a live "away" counter and a Retry button;
// when it comes back, the app says "Back online" and how long it was away.
import { expect, test } from '@playwright/test';
import { mockApi } from './mock-api';

async function trySignIn(page: import('@playwright/test').Page) {
  await page.getByPlaceholder('Email address').fill('asha@example.com');
  await page.getByPlaceholder('Password').fill('secret123');
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test('shows a live downtime counter, then recovery', async ({ page }) => {
  const server = await mockApi(page);
  await page.goto('/login');
  server.goDown();
  await trySignIn(page);

  await expect(page.getByTestId('connection-away')).toBeVisible();
  await expect(page.getByText('Server not answering')).toBeVisible();
  const counter = page.getByTestId('connection-counter');
  const first = await counter.innerText();
  await expect(counter).not.toHaveText(first, { timeout: 4_000 });

  server.comeBack();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByTestId('connection-back')).toBeVisible();
  await expect(page.getByText('Back online')).toBeVisible();
  await expect(page.getByTestId('connection-away')).toBeHidden();
});

test('a host error page (503) also counts as the server being away', async ({ page }) => {
  await mockApi(page, { 'POST /login': { status: 503, body: { error: 'Service unavailable' } } });
  await page.goto('/login');
  await trySignIn(page);
  await expect(page.getByTestId('connection-away')).toBeVisible();
});
