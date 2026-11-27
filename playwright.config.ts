import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/ui',
  use: {
    baseURL: 'http://localhost:8081',
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
    viewport: { width: 390, height: 844 },
  },
  workers: 1,
  reporter: 'list',
  timeout: 180000,
});
