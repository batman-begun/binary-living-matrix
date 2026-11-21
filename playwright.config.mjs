// SPDX-License-Identifier: MPL-2.0

import { defineConfig, devices } from '@playwright/test'

export const baseURL = 'http://127.0.0.1:4175'
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  use: { baseURL },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4175 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
})
