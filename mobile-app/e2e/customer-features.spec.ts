// The customer features that make shopping quicker: smart search, "Your usuals" with Add all, and free-delivery progress.
import { expect, test, type Page } from '@playwright/test';
import { mockApi } from './mock-api';
import { ANSWERS_FOR, USERS } from './fixtures';

async function openShop(page: Page) {
  await mockApi(page, { ...ANSWERS_FOR.customer, 'POST /login': { body: { user: USERS.customer, token: 'fake-token' } } });
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill(USERS.customer.email);
  await page.getByPlaceholder('Password').fill('secret123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/shop/);
}

test('smart search offers popular items, then remembers what you searched', async ({ page }) => {
  await openShop(page);
  const box = page.getByPlaceholder('Search for milk, fruits, snacks…');
  await box.click();
  await expect(page.getByText('Popular in this shop')).toBeVisible();
  await box.fill('milk');
  // The fake server does not filter, so only the heading is checked here; the real server does the matching.
  await expect(page.getByText(/results? for "milk"/)).toBeVisible();
  await box.press('Enter');
  await page.getByLabel('Clear search').click();
  await box.click();
  await expect(page.getByText('Recent searches')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search milk' })).toBeVisible();
});

test('"Your usuals" puts everything you usually buy in the cart in one tap', async ({ page }) => {
  await openShop(page);
  await expect(page.getByText('Your usuals')).toBeVisible();
  await page.getByRole('button', { name: /Add all/ }).click();
  await expect(page.getByText(/usuals? added to cart/)).toBeVisible();
});

test('the cart shows how much more is needed for free delivery', async ({ page }) => {
  await openShop(page);
  await page.goto('/shop/product/p-mango');
  await page.getByRole('button', { name: /Add to cart/ }).click();
  await page.goto('/shop/cart');
  await expect(page.getByText('Add Rs. 250.00 more for free delivery')).toBeVisible();
});
