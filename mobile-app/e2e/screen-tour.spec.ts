// Screen tour: signs in as each role (against the fake server), opens every main screen, and checks it draws without
// crashing, is not blank and does not scroll sideways. A screenshot of each lands in e2e/.screens/<size>/ for review.
import { expect, test, type Page } from '@playwright/test';
import { mockApi } from './mock-api';
import { ANSWERS_FOR, USERS, type RoleName } from './fixtures';

const SCREENS: Record<RoleName, string[]> = {
  customer: ['/shop/product/p-mango', '/shop', '/shop/cart', '/shop/checkout', '/shop/orders', '/shop/order/o-1002', '/shop/account', '/shop/nearby', '/shop/addresses'],
  tenant_owner: ['/owner', '/owner/orders', '/owner/order/o-1001', '/owner/products', '/owner/product/p-mango', '/owner/delivery', '/owner/more', '/owner/earnings', '/owner/customers', '/owner/coupons', '/owner/categories', '/owner/store-settings', '/owner/refunds'],
  delivery_partner: ['/rider', '/rider/order/o-2002', '/rider/history', '/rider/earnings', '/rider/profile'],
  platform_admin: ['/admin', '/admin/stores', '/admin/partners', '/admin/deliveries', '/admin/more', '/admin/earnings', '/admin/status', '/admin/themes', '/admin/sales', '/admin/growth', '/admin/users', '/admin/refunds']
};

// Finds the page's own scroll area (the one on top in the middle of the screen), scrolls it to the end, and says how
// far its last text still sits below the tab bar (or the screen edge). More than a few pixels means part of the page
// cannot be reached by scrolling.
async function unreachableBelow(page: Page) {
  return page.evaluate(async () => {
    // Only the bottom tab bar counts; filter pills near the top use the same 'tab' role.
    const tabs = [...document.querySelectorAll('[role=tab]')].filter((tab) => tab.getBoundingClientRect().height > 0 && tab.getBoundingClientRect().top > window.innerHeight / 2);
    const floor = tabs.length > 0 ? Math.min(...tabs.map((tab) => tab.getBoundingClientRect().top)) - 8 : window.innerHeight;
    const middle = document.elementFromPoint(window.innerWidth / 2, Math.min(floor, window.innerHeight) / 2);
    let scroller = middle;
    while (scroller && !(getComputedStyle(scroller).overflowY === 'auto' || getComputedStyle(scroller).overflowY === 'scroll')) scroller = scroller.parentElement;
    if (!scroller) return 0;
    // Content may still be arriving, so keep scrolling until the page stops growing.
    let height = -1;
    for (let tries = 0; tries < 6 && height !== scroller.scrollHeight; tries += 1) {
      height = scroller.scrollHeight;
      scroller.scrollTop = scroller.scrollHeight;
      await new Promise((done) => setTimeout(done, 300));
    }
    const texts = [...scroller.querySelectorAll('div,span')].filter((node) => node.childNodes.length === 1 && node.firstChild?.nodeType === 3 && node.textContent?.trim() && node.getBoundingClientRect().height > 0);
    if (texts.length === 0) return 0;
    const lowestNode = texts.reduce((low, node) => (node.getBoundingClientRect().bottom > low.getBoundingClientRect().bottom ? node : low));
    const limit = Math.min(floor, scroller.getBoundingClientRect().bottom);
    const gap = Math.max(0, Math.round(lowestNode.getBoundingClientRect().bottom - limit));
    return gap;
  });
}

async function signIn(page: Page, role: RoleName) {
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill(USERS[role].email);
  await page.getByPlaceholder('Password').fill('secret123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL(/login/);
}

for (const role of Object.keys(SCREENS) as RoleName[]) {
  test(`${role} screens draw cleanly`, async ({ page }, info) => {
    test.setTimeout(240_000);
    const crashes: string[] = [];
    page.on('pageerror', (error) => crashes.push(error.message));
    // React's warnings about broken page structure (like a button inside a button) count as failures too.
    page.on('console', (message) => { if (message.type() === 'error' && message.text().includes('cannot')) crashes.push(message.text().slice(0, 200)); });
    await mockApi(page, { ...ANSWERS_FOR[role], 'POST /login': { body: { user: USERS[role], token: 'fake-token' } } });
    await signIn(page, role);
    for (const path of SCREENS[role]) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(400);
      const name = path.split('/').filter(Boolean).join('-');
      // Put something in the cart on the product page, so the cart and its floating bar are seen with items.
      if (path === '/shop/product/p-mango') await page.getByRole('button', { name: /Add to cart/ }).click();
      await page.screenshot({ path: `e2e/.screens/${info.project.name}/${name}.png`, fullPage: true });
      expect(crashes, `${path} crashed`).toEqual([]);
      expect((await page.locator('body').innerText()).trim().length, `${path} is blank`).toBeGreaterThan(20);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(1);
      expect(await unreachableBelow(page), `${path} cannot be scrolled to the bottom`).toBeLessThanOrEqual(4);
      expect(await page.locator('[role=button] [role=button], button button').count(), `${path} has a button inside a button`).toBe(0);
    }
  });
}

test('sign-in and sign-up screens draw cleanly', async ({ page }, info) => {
  const crashes: string[] = [];
  page.on('pageerror', (error) => crashes.push(error.message));
  await mockApi(page);
  for (const path of ['/login', '/register', '/rider-register']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `e2e/.screens/${info.project.name}/${path.slice(1)}.png`, fullPage: true });
    expect(crashes, `${path} crashed`).toEqual([]);
    expect(await unreachableBelow(page), `${path} cannot be scrolled to the bottom`).toBeLessThanOrEqual(4);
  }
});
