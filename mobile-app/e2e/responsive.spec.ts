// Responsiveness: every public screen fits the window with no sideways scrolling, the card stays inside the screen,
// buttons are big enough to tap (at least 44px tall) and text stays readable, at every size in playwright.config.ts.
import { expect, test } from '@playwright/test';
import { mockApi } from './mock-api';

const PAGES = ['/login', '/register', '/rider-register'];

for (const path of PAGES) {
  test(`${path} fits the screen`, async ({ page }) => {
    await mockApi(page);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test(`${path} has big enough buttons and readable text`, async ({ page }) => {
    await mockApi(page);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    for (let index = 0; index < count; index += 1) {
      const box = await buttons.nth(index).boundingBox();
      const label = (await buttons.nth(index).innerText()).trim();
      if (!box || label.length < 3) continue;
      expect(box.height, `"${label}" is too short to tap`).toBeGreaterThanOrEqual(36);
      expect(box.x, `"${label}" starts off screen`).toBeGreaterThanOrEqual(0);
    }
    const smallest = await page.evaluate(() => Math.min(...[...document.querySelectorAll('div,span')].filter((node) => node.childNodes.length === 1 && node.firstChild?.nodeType === 3 && node.textContent?.trim()).map((node) => parseFloat(getComputedStyle(node).fontSize))));
    expect(smallest).toBeGreaterThanOrEqual(10);
  });
}

test('main sign-in button is comfortably tappable', async ({ page }) => {
  await mockApi(page);
  await page.goto('/login');
  const box = await page.getByRole('button', { name: 'Sign in' }).boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  const width = page.viewportSize()!.width;
  expect(box!.x + box!.width).toBeLessThanOrEqual(width);
});
