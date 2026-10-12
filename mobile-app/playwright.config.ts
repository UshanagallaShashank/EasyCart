// UX and responsiveness checks on the web build of the app, at phone, small phone, tablet and desktop sizes.
// Every server call is answered by a fake (e2e/mock-api.ts), so the tests never touch the real backend or database.
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 8099);

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  // The screen tour is heavy; a few workers at a time keeps timings steady on a laptop.
  workers: 3,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/.report' }]],
  outputDir: 'e2e/.results',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'node e2e/serve.mjs', port: PORT, reuseExistingServer: true },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'small-phone', use: { ...devices['Pixel 7'], viewport: { width: 320, height: 640 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 }, hasTouch: true } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }
  ]
});
