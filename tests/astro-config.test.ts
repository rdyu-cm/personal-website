import { expect, test, vi } from "vitest";

const githubPagesSite = "https://rdyu-cm.github.io/personal-website";
const workerSite = "https://site.rdyu-cm.workers.dev";
const rootDomainSite = "https://research.example.com";

const loadDefaultConfig = async () => {
  vi.resetModules();
  delete process.env.SITE_URL;
  return (await import("../astro.config.mjs")).default;
};

const loadConfig = async (siteUrl: string) => {
  vi.resetModules();
  process.env.SITE_URL = siteUrl;
  return (await import("../astro.config.mjs")).default;
};

test("defaults production builds to the root Worker URL", async () => {
  const config = await loadDefaultConfig();

  expect(config.site).toBe(workerSite);
  expect(config.base).toBeUndefined();
});

test("derives the GitHub Pages repository base from SITE_URL", async () => {
  const config = await loadConfig(githubPagesSite);

  expect(config.site).toBe(githubPagesSite);
  expect(config.base).toBe("/personal-website");
  expect(config.trailingSlash).toBe("never");
});

test("uses no base for a root-domain SITE_URL", async () => {
  const config = await loadConfig(rootDomainSite);

  expect(config.site).toBe(rootDomainSite);
  expect(config.base).toBeUndefined();
});
