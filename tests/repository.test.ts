import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

  test("documents the GitHub Pages deployment", () => {
    const readme = read("README.md");

    expect(readme).toContain("deployed to GitHub Pages");
    expect(readme).toContain("https://rdyu-cm.github.io/personal-website");
    expect(readme).toMatch(/Pushes to `main`\s+build and verify the site/);
    expect(readme).toContain(".github/workflows/ci.yml");
    expect(readme).not.toContain("src/pages/cv.astro");
    expect(readme).not.toContain("HTML CV");
  });

  test("retains no Cloudflare deployment surface", () => {
    const tracked = execFileSync("git", ["ls-files"], {
      cwd: root,
      encoding: "utf8",
    });

    expect(tracked).not.toMatch(/wrangler/i);
    for (const file of [
      "README.md",
      "astro.config.mjs",
      ".github/workflows/ci.yml",
    ]) {
      expect(read(file)).not.toMatch(/cloudflare|wrangler|workers\.dev/i);
    }
  });

  test("publishes the verified build to GitHub Pages from CI", () => {
    const workflow = read(".github/workflows/ci.yml");

    expect(workflow).toContain(
      "SITE_URL: https://rdyu-cm.github.io/personal-website",
    );
    expect(workflow).toContain("actions/upload-pages-artifact@");
    expect(workflow).toContain("actions/deploy-pages@");
    expect(workflow).toMatch(/deploy:\s+needs: verify/);
    expect(workflow).toMatch(/pages: write/);
    expect(workflow).toMatch(/id-token: write/);
    expect(existsSync(resolve(root, "public/.nojekyll"))).toBe(true);
  });

  test("documents the four editable research-profile content sources", () => {
    const readme = read("README.md");

    for (const source of [
      "src/data/profile.ts",
      "src/content/research/",
      "src/content/publications/",
      "src/content/about/about.md",
    ]) {
      expect(readme).toContain(source);
    }
    expect(readme).not.toContain("src/content/projects/");
    expect(readme).not.toMatch(/\bone project\b|\bPapers\b/);
  });

  test("documents every required research and publication frontmatter field", () => {
    const readme = read("README.md");
    const researchRequirements =
      readme.match(
        /Research records require([\s\S]*?)\. Publication records/,
      )?.[1] ?? "";
    const publicationRequirements =
      readme.match(
        /Publication records\s+require([\s\S]*?)\. Publication `venue`/,
      )?.[1] ?? "";

    for (const field of [
      "title",
      "lab",
      "institution",
      "date",
      "datePrecision",
      "status",
      "summary",
      "methods",
      "featured",
      "draft",
    ]) {
      expect(researchRequirements).toContain(`\`${field}\``);
    }
    for (const field of [
      "title",
      "authors",
      "date",
      "datePrecision",
      "type",
      "status",
      "themes",
      "featured",
      "draft",
    ]) {
      expect(publicationRequirements).toContain(`\`${field}\``);
    }
  });

  test("keeps the committed social preview synchronized with its renderer", () => {
    expect(() =>
      execFileSync("node", ["scripts/render-social-preview.mjs", "--check"], {
        cwd: root,
        encoding: "utf8",
        stdio: "pipe",
      }),
    ).not.toThrow();
  });

  test("uses the twilight palette in generated brand assets", () => {
    const favicon = read("public/favicon.svg");
    const renderer = read("scripts/render-social-preview.mjs");

    for (const source of [favicon, renderer]) {
      expect(source).toContain("#251f37");
      expect(source).toContain("#e8b6d5");
      expect(source).toContain("#a9dcdd");
      expect(source).not.toMatch(/#11121c|#8178e8|#67d8d0/);
    }
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

  test("does not ship obsolete site labels, project schema, or project content", () => {
    const tracked = execFileSync("git", ["ls-files"], {
      cwd: root,
      encoding: "utf8",
    });
    const schema = read("src/content.config.ts");

    expect(tracked).not.toContain("src/content/projects/");
    expect(schema).not.toContain('base: "./src/content/projects"');
    expect(schema).not.toMatch(/\bprojects\b/);
    for (const file of [
      "src/pages/index.astro",
      "src/components/Header.astro",
      "src/pages/publications.astro",
      "src/pages/404.astro",
    ]) {
      expect(read(file)).not.toMatch(/Research outputs|>Papers<|>Projects</i);
    }
  });
});
