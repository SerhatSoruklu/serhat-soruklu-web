import { defineConfig, devices } from '@playwright/test';

import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testMatch: 'smoke.spec.ts',
  projects: [
    {
      name: 'firefox-smoke',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit-smoke',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
});
