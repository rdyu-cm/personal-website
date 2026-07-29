import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("public repository operations", () => {
  test("documents the Cloudflare Workers Static Assets deployment", () => {
    const readme = read("README.md");

    expect(readme).toContain("Cloudflare Workers Static Assets");
    expect(readme).toContain("Worker `rdyu-site`");
    expect(readme).toMatch(/Pushes to `main`\s+automatically build and deploy/);
    expect(readme).toContain("npx wrangler@latest deploy");
    expect(readme).not.toContain("src/pages/cv.astro");
    expect(readme).not.toContain("HTML CV");
    expect(readme).not.toContain("GitHub Pages");
  });

  test("keeps the resume private", () => {
    expect(
      execFileSync("git", ["check-ignore", "-v", "Yu_Ryan_Resume.pdf"], {
        cwd: root,
        encoding: "utf8",
      }),
    ).toContain("/Yu_Ryan_Resume.pdf");
    expect(
      execFileSync("git", ["ls-files", "--", "Yu_Ryan_Resume.pdf"], {
        cwd: root,
        encoding: "utf8",
      }),
    ).toBe("");
  });
});
