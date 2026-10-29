import { defineConfig } from '@playwright/test';

const external = process.env.BASE_URL;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  snapshotPathTemplate: external
    ? '{testDir}/baselines/hosted/{platform}/{projectName}/{testFilePath}/{arg}{ext}'
    : '{testDir}/baselines/{platform}/{projectName}/{testFilePath}/{arg}{ext}',
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixels: 0, threshold: 0.2 } },
  use: {
    baseURL: external || 'http://127.0.0.1:3000',
    testIdAttribute: 'data-test',
    locale: 'en-US', timezoneId: 'UTC', colorScheme: 'light',
    contextOptions: { reducedMotion: 'reduce' }, trace: 'retain-on-failure', screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'chromium-narrow', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: external || process.env.VISUAL_SERVER_MANAGED ? undefined : {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1', url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI, timeout: 60000,
  },
});
