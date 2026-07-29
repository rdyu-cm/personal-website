import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("public repository operations", () => {
  test("ships a 1200 by 630 social preview PNG", () => {
    const image = readFileSync(resolve(root, "public/social-preview.png"));

    expect(image.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });

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

  test("does not publish agent planning artifacts", () => {
    const tracked = execFileSync("git", ["ls-files"], {
      cwd: root,
      encoding: "utf8",
    }).split("\n");

    expect(
      tracked.filter(
        (path) =>
          path.startsWith(".superpowers/") ||
          path.startsWith("docs/superpowers/"),
      ),
    ).toEqual([]);
  });
});
