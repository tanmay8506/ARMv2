import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // Run sequentially for concurrency tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "tests/playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  outputDir: "tests/test-results",
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-mobile-375",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
