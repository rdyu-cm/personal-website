import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testMatch: "tests/**/*.spec.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "pixel-7",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    env: { SITE_URL: "http://127.0.0.1:4321" },
    command: "npm run dev -- --host 127.0.0.1",
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
});
