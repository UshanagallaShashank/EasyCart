// A signed-in admin can reach System status from More, and it shows the server's uptime and the optional features.
import { expect, test } from '@playwright/test';
import { mockApi } from './mock-api';

const TOTALS = { stores: 2, active_stores: 2, owners: 2, customers: 5, admins: 1, orders: 12, pending_orders: 1, gmv: 4200 };
const ADMIN_ANSWERS = {
  'GET /admin/stats': { body: { totals: TOTALS, daily_revenue: [], top_stores: [] } },
  'GET /admin/tenants': { body: { tenants: [] } },
  'GET /admin/riders': { body: { riders: [], stores: [] } },
  'GET /admin/deliveries': { body: { deliveries: [] } },
  'POST /live/ticket': { status: 404, body: { error: 'not in tests' } }
};

const ADMIN = { id: 'admin-1', username: 'Test Admin', email: 'admin@example.test', phone_number: '0000000000', role: 'platform_admin' };

test('admin opens System status from More', async ({ page }) => {
  await mockApi(page, { ...ADMIN_ANSWERS, 'POST /login': { body: { user: ADMIN, token: 'fake-token' } } });
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill(ADMIN.email);
  await page.getByPlaceholder('Password').fill('secret123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.getByRole('tab', { name: 'More' }).click();
  await page.getByText('System status').click();
  await expect(page).toHaveURL(/\/admin\/status/);
  await expect(page.getByRole('tab')).toHaveCount(5);
  await expect(page.getByRole('tab', { name: 'More' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('All systems running')).toBeVisible();
  await expect(page.getByText('Up for 1:00:00')).toBeVisible();
  await expect(page.getByText('AI help for owners')).toBeVisible();
  await expect(page.getByText('No outages seen on this phone.')).toBeVisible();
});
