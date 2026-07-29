import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Cloudflare Worker configuration", () => {
  it("deploys the Astro build as static assets without a Worker entry point", () => {
    const configPath = resolve("wrangler.jsonc");

    expect(existsSync(configPath)).toBe(true);
    if (!existsSync(configPath)) return;

    const json = readFileSync(configPath, "utf8").replace(/,\s*([}\]])/g, "$1");
    const config = JSON.parse(json) as {
      name?: string;
      compatibility_date?: string;
      main?: string;
      assets?: {
        directory?: string;
        not_found_handling?: string;
      };
    };

    expect(config).toMatchObject({
      name: "rdyu-site",
      compatibility_date: "2026-07-29",
      assets: {
        directory: "./dist",
        not_found_handling: "404-page",
      },
    });
    expect(config).not.toHaveProperty("main");
  });
});
