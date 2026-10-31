import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  fullyParallel: true,
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure', launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {} },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1100 } } }, { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } }],
  webServer: { command: 'npm start', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI }
});
