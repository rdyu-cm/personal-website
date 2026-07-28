import { describe, expect, test } from "vitest";

import { GET } from "../src/pages/robots.txt";

describe("robots.txt", () => {
  test.each([
    [
      "https://rdyu-cm.github.io/personal-website",
      "https://rdyu-cm.github.io/personal-website/sitemap-index.xml",
    ],
    [
      "https://research.example.com",
      "https://research.example.com/sitemap-index.xml",
    ],
  ])("uses the configured site for %s", async (site, sitemap) => {
    const response = await GET({ site: new URL(site) } as Parameters<
      typeof GET
    >[0]);

    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toBe(
      `User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`,
    );
  });
});
