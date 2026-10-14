// Sign-in UX: the form guides people (button waits for both fields), errors are shown clearly, and links lead on.
import { expect, test } from '@playwright/test';
import { mockApi } from './mock-api';

test.beforeEach(async ({ page }) => {
  await mockApi(page, { 'POST /login': { status: 401, body: { error: 'Wrong email or password' } } });
  await page.goto('/login');
});

test('sign-in card shows its fields and a waiting button', async ({ page }) => {
  await expect(page.getByText('Welcome back')).toBeVisible();
  await expect(page.getByPlaceholder('Email address')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled();
});

test('button wakes up once both fields are filled', async ({ page }) => {
  await page.getByPlaceholder('Email address').fill('asha@example.com');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  await page.getByPlaceholder('Password').fill('secret123');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
});

test('a wrong password gives clear feedback', async ({ page }) => {
  await page.getByPlaceholder('Email address').fill('asha@example.com');
  await page.getByPlaceholder('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Wrong email or password')).toBeVisible();
});

test('password can be shown and hidden', async ({ page }) => {
  const password = page.getByPlaceholder('Password');
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByLabel('Show password').click();
  await expect(password).not.toHaveAttribute('type', 'password');
});

test('links lead to customer and partner sign-up', async ({ page }) => {
  await page.getByRole('button', { name: 'New here? Create an account' }).click();
  await expect(page).toHaveURL(/register/);
  await page.goto('/login');
  await page.getByText('Become a delivery partner').click();
  await expect(page).toHaveURL(/rider-register/);
});
