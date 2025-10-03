import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60000,
  reporter: [['list']],
  use: { baseURL: process.env.STUDIO_BASE_URL || 'http://localhost:5173', trace: 'on-first-retry', video: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
