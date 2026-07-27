import { expect, test, vi } from "vitest";

const canonicalSite = "https://rdyu-cm.github.io/personal-website";

const loadConfig = async (siteUrl?: string) => {
  vi.resetModules();
  if (siteUrl) {
    process.env.SITE_URL = siteUrl;
  } else {
    delete process.env.SITE_URL;
  }
  return (await import("../astro.config.mjs")).default;
};

test("keeps local development at the server root", async () => {
  const developmentConfig = await loadConfig();

  expect(developmentConfig.site).toBe(canonicalSite);
  expect(developmentConfig.base).toBeUndefined();
});

test("uses the public canonical URL and repository base for production builds", async () => {
  const productionConfig = await loadConfig(canonicalSite);

  expect(productionConfig.site).toBe(canonicalSite);
  expect(productionConfig.base).toBe("/personal-website");
});
