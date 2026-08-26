// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 90 * 1000,
  retries: 0,
  // Sequential against a single shared test account - parallel workers
  // would race each other's state changes (quota, plan, invoices) on
  // the same account. Read-only suites can safely raise this.
  workers: 1,
  use: {
    baseURL: 'https://dashboard.demo-saas.example.com',
    storageState: './utils/auth-state.json',
    navigationTimeout: 45 * 1000,
    actionTimeout: 8 * 1000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  reporter: [['list'], ['html', { outputFolder: 'report', open: 'never' }]],
});
