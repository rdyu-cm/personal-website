# Site Polish and Cloudflare README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align browser/share metadata with Deep Orbit, document the actual Cloudflare deployment, remove public agent artifacts, and preserve future ideas locally.

**Architecture:** Keep the Astro site static and dependency-free at runtime. Generate one checked-in 1200×630 PNG through the existing Playwright toolchain, make it the shared SEO default, update operational documentation, and remove development-process files from the current public tree.

**Tech Stack:** Astro 6, TypeScript 5.9, SVG, PNG, Playwright, Vitest, Cloudflare Workers Static Assets

## Global Constraints

- Keep `https://site.rdyu-cm.workers.dev` as the canonical fallback and `rdyu-site` as the Worker name.
- Add no runtime dependency, SSR adapter, Worker compute, DNS change, push, deployment, or merge.
- Preserve page-specific `image` overrides while defaulting every other page to `/social-preview.png`.
- The social preview is exactly 1200×630 and contains only approved public copy and abstract code-native motifs.
- Publish no résumé PDF, phone number, private/unpublished research material, scientific data, lab logo, or scientific interactive.
- Keep the root résumé PDF ignored and untracked.
- Remove `.superpowers/` and `docs/superpowers/` from the current tracked tree without rewriting history.
- Store the future roadmap only in `.notes/future-site-improvements.md`, excluded through `.git/info/exclude`.

---

## File Structure

- `scripts/render-social-preview.mjs`: deterministic Playwright renderer for the checked-in share card.
- `public/social-preview.png`: 1200×630 Open Graph/Twitter image.
- `public/favicon.svg`: Deep Orbit molecular-node browser mark.
- `src/components/Seo.astro`: default/override image resolution and complete social metadata.
- `src/layouts/BaseLayout.astro`: Deep Orbit browser theme color.
- `package.json`: repeatable `social-preview` asset command.
- `tests/seo.test.ts`: social-image URL and public metadata regressions.
- `tests/site.spec.ts`: rendered default/override social metadata checks.
- `tests/repository.test.ts`: PNG dimensions, README deployment truth, privacy, and artifact-cleanup assertions.
- `README.md`: current Cloudflare Workers Static Assets operations guide.
- `.git/info/exclude`: local-only `.notes/` exclusion.
- `.notes/future-site-improvements.md`: untracked future roadmap.
- `.superpowers/` and `docs/superpowers/`: deleted from the tracked tree.

---

### Task 1: Deep Orbit Browser and Social Metadata

**Files:**
- Create: `scripts/render-social-preview.mjs`
- Create: `public/social-preview.png`
- Modify: `public/favicon.svg`
- Modify: `src/components/Seo.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `package.json`
- Modify: `tests/seo.test.ts`
- Modify: `tests/site.spec.ts`

**Interfaces:**
- Consumes: `resolveSocialImage(image, site, baseUrl)` and existing `BaseLayout.image`.
- Produces: `npm run social-preview`, `/social-preview.png`, and default absolute Open Graph/Twitter image metadata.

- [ ] **Step 1: Add failing social metadata browser assertions**

Add to `tests/site.spec.ts`:

```ts
test("shared SEO exposes the Deep Orbit social preview", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#11121c",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "http://127.0.0.1:4321/social-preview.png",
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    "content",
    "1200",
  );
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
    "content",
    "630",
  );
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    "Ryan Yu — AI for science and molecular simulation",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
npm run test:e2e -- --grep "shared SEO exposes"
```

Expected: FAIL because the theme color is cobalt and no default social image metadata exists.

- [ ] **Step 3: Implement default metadata and Deep Orbit browser colors**

In `src/components/Seo.astro`, replace the optional image resolution with:

```ts
const socialImage = resolveSocialImage(
  image ?? "/social-preview.png",
  Astro.site ?? Astro.url,
  import.meta.env.BASE_URL,
);
const socialImageAlt =
  image === undefined
    ? "Ryan Yu — AI for science and molecular simulation"
    : `${documentTitle} social preview`;
```

Render complete metadata unconditionally:

```astro
<meta property="og:image" content={socialImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content={socialImageAlt} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content={socialImage} />
<meta name="twitter:image:alt" content={socialImageAlt} />
```

Change `BaseLayout.astro` to:

```astro
<meta name="theme-color" content="#11121c" />
```

Update `public/favicon.svg` while preserving its mark:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Ryan Yu molecular mark">
  <rect width="32" height="32" rx="6" fill="#11121c"/>
  <path d="M9 9.5 16 16l7-6.5M16 16l7 6.5M16 16l-7 6.5" fill="none" stroke="#8178e8" stroke-width="2"/>
  <circle cx="9" cy="9.5" r="2.5" fill="#f0effa"/>
  <circle cx="23" cy="9.5" r="2.5" fill="#67d8d0"/>
  <circle cx="16" cy="16" r="2.75" fill="#f0effa"/>
  <circle cx="9" cy="22.5" r="2.5" fill="#67d8d0"/>
  <circle cx="23" cy="22.5" r="2.5" fill="#f0effa"/>
</svg>
```

- [ ] **Step 4: Add the deterministic renderer and generate the PNG**

Create `scripts/render-social-preview.mjs` using `chromium` from
`@playwright/test`. It must set a 1200×630 viewport, render one fixed HTML
document with `#11121c` canvas, `#8178e8` periwinkle, `#67d8d0` cyan,
`#f0effa` text, the exact approved copy, and an abstract five-node molecular
motif. Write a non-transparent screenshot to
`public/social-preview.png`, then close the browser in `finally`.

Add to `package.json`:

```json
"social-preview": "node scripts/render-social-preview.mjs"
```

Run:

```bash
npm run social-preview
```

Expected: exits 0 and creates a 1200×630 PNG.

- [ ] **Step 5: Verify and commit browser/social metadata**

Run:

```bash
npm run format
npm run test:unit -- tests/seo.test.ts
npm run test:e2e -- --grep "shared SEO exposes|shared shell"
npm run build
```

Expected: PASS and generated HTML contains an absolute
`https://site.rdyu-cm.workers.dev/social-preview.png` URL.

Commit:

```bash
git add package.json scripts/render-social-preview.mjs public/social-preview.png public/favicon.svg src/components/Seo.astro src/layouts/BaseLayout.astro tests/seo.test.ts tests/site.spec.ts
git commit -m "feat: add Deep Orbit sharing metadata"
```

---

### Task 2: Cloudflare Operations README and Local Roadmap

**Files:**
- Modify: `README.md`
- Create: `tests/repository.test.ts`
- Modify locally only: `.git/info/exclude`
- Create locally only: `.notes/future-site-improvements.md`

**Interfaces:**
- Consumes: `astro.config.mjs`, `wrangler.jsonc`, `package.json`, and `.gitignore`.
- Produces: accurate public operating instructions plus an untracked roadmap.

- [ ] **Step 1: Add failing repository documentation tests**

Create `tests/repository.test.ts`:

```ts
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
    expect(readme).toContain("Pushes to `main` automatically build and deploy");
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
```

- [ ] **Step 2: Run the documentation test and verify failure**

Run:

```bash
npm run test:unit -- tests/repository.test.ts
```

Expected: FAIL because the README still describes the deleted HTML CV.

- [ ] **Step 3: Rewrite the README**

Keep these sections, updated to current truth:

```md
# Ryan Yu research website

Static Astro research portfolio deployed as Cloudflare Workers Static Assets.
The canonical public URL is `https://site.rdyu-cm.workers.dev`.

## Local development
## Updating public content
## Privacy and publication boundary
## Cloudflare deployment
## Custom-domain handoff
## Release verification
```

The Cloudflare section must state:

```md
Worker `rdyu-site` is connected to `rdyu-cm/personal-website`. Pushes to
`main` automatically build and deploy through Cloudflare Workers Builds.
```

Include the exact production settings from the approved spec and preserve the
root résumé ignore/privacy guidance without describing a CV route.

- [ ] **Step 4: Create the local-only roadmap**

Append this exact line to the worktree Git metadata exclude file if absent:

```text
.notes/
```

Create `.notes/future-site-improvements.md` with:

```md
# Future website improvements

- Connect a custom domain and update `SITE_URL`.
- Add ORCID and Google Scholar after confirming the public profile URLs.
- Add one explicitly public, scientifically meaningful figure per project.
- Add BibTeX or citation-download support.
- Consider a build-derived “Last updated” indicator only if it remains accurate.
- Revisit the deferred scientific interactives as a separate project.
```

Verify:

```bash
git check-ignore -v .notes/future-site-improvements.md
git ls-files -- .notes
```

Expected: the note is ignored and `git ls-files` prints nothing.

- [ ] **Step 5: Verify and commit the public documentation**

Run:

```bash
npm run format
npm run test:unit -- tests/repository.test.ts
git diff --check
```

Expected: PASS.

Commit:

```bash
git add README.md tests/repository.test.ts
git commit -m "docs: describe Cloudflare site operations"
```

---

### Task 3: Remove Public Agent Artifacts and Release-Verify

**Files:**
- Delete: `.superpowers/sdd/task-4-report.md`
- Delete: `docs/superpowers/plans/`
- Delete: `docs/superpowers/specs/`
- Modify: `tests/repository.test.ts`

**Interfaces:**
- Consumes: the complete current branch.
- Produces: a clean public tree with verified static output and no private artifacts.

- [ ] **Step 1: Add a failing current-tree cleanup assertion**

Add to `tests/repository.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the cleanup test and verify failure**

Run:

```bash
npm run test:unit -- tests/repository.test.ts
```

Expected: FAIL and list the currently tracked agent report, specifications, and plans.

- [ ] **Step 3: Delete public agent artifacts**

Delete the tracked `.superpowers/` and `docs/superpowers/` trees from the
current branch. Do not touch `.notes/`, rewrite history, or remove source,
content, tests, or deployment configuration.

- [ ] **Step 4: Run complete release verification**

Run:

```bash
npm run format:check
npm run check
npm run test:unit
npm run test:e2e
npm run build
npx wrangler deploy --dry-run
```

Expected: all commands exit 0; the test counts include the new repository tests;
Wrangler performs no deployment.

Inspect:

```bash
test ! -e dist/cv/index.html
test -e dist/social-preview.png
rg -n 'https://site\\.rdyu-cm\\.workers\\.dev/social-preview\\.png' dist
git ls-files | rg '^\\.superpowers/|^docs/superpowers/' && exit 1 || true
git ls-files -- Yu_Ryan_Resume.pdf
rg -n -i 'tel:|Yu_Ryan_Resume|\\.pdf' dist
```

Expected: no CV, agent artifact, tracked résumé, phone link, or PDF; the social
preview exists and absolute metadata appears in generated pages.

- [ ] **Step 5: Commit cleanup and request review**

Commit:

```bash
git add -A .superpowers docs/superpowers tests/repository.test.ts
git commit -m "chore: remove public agent artifacts"
```

Report the branch, commits, exact verification outcomes, social-preview path,
and local-only roadmap path. Do not merge, push, or deploy without explicit
approval.

