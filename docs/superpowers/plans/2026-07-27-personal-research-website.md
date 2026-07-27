# Personal AI-for-Science Research Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a fast, accessible, content-driven personal website that presents one coherent AI-for-science research identity to academic and industry audiences.

**Architecture:** Astro 6 generates a static site from validated profile data and typed project/publication content collections. Page composition remains build-time rendered, with browser JavaScript limited to controls that genuinely need it; Cloudflare Pages serves the portable `dist/` artifact.

**Tech Stack:** Node.js 22.12+, npm, Astro 6, TypeScript strict mode, Astro Content Layer API, Markdown/MDX, `@astrojs/sitemap`, Vitest, Playwright, `@axe-core/playwright`, Prettier, and Cloudflare Pages.

## Global Constraints

- Use Node.js `22.12.0` or higher locally and in Cloudflare Pages.
- Produce ordinary static files; do not add a server adapter, database, CMS, authentication, contact form, or server functions.
- Never publish invented biography, affiliation, collaborators, research results, publication status, or metrics.
- Exclude drafts from production with an explicit `draft` field and tested selectors.
- Use only rights-cleared research figures; do not use stock AI imagery.
- Ship no client-side framework for static content.
- Meet WCAG AA, honor `prefers-reduced-motion`, and target Lighthouse scores of at least 95 in all four categories.
- Use Cloudflare Pages Git integration; do not add Cloudflare-specific runtime APIs.
- Do not connect a custom domain until the user approves the production preview.

---

## File Map

```text
.github/workflows/ci.yml            # Verification on pull requests and main
.nvmrc                              # Node runtime floor
astro.config.mjs                    # Static output, canonical URL, sitemap
package.json                        # Commands and dependencies
playwright.config.ts                # Browser verification
public/{cv,images}/                 # Approved public assets
public/{favicon.svg,robots.txt}     # Identity and crawl controls
src/components/                     # Header, footer, SEO, cards, figures, lists
src/content/{projects,publications} # Markdown/MDX research records
src/content.config.ts               # Runtime-validated content schemas
src/data/profile.ts                 # Approved public identity data
src/layouts/BaseLayout.astro        # Shared document shell
src/lib/{content,structured-data}.ts# Pure content and metadata helpers
src/pages/                          # Home, research, projects, papers, about, CV, 404
src/styles/global.css               # Tokens, typography, responsive primitives
tests/                              # Vitest and Playwright regression checks
```

Production identity copy is not embedded in this plan because it must come from
the owner. Test fixtures may use synthetic data; production files may not use
guessed identity or research claims.

### Task 1: Bootstrap Astro and the Verification Harness

**Files:**
- Create: `.nvmrc`, `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`
- Create: `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`
- Create: `src/pages/index.astro`, `src/styles/global.css`, `tests/site.spec.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: approved design specification.
- Produces: `npm run dev`, `format:check`, `check`, `test:unit`, `test:e2e`, and `build`; `dist/` static output.

- [ ] **Step 1: Add the runtime and dependency manifests**

Set `.nvmrc` to `22.12.0`. Create `package.json` with:

```json
{
  "name": "personal-research-website",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "astro check",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test": "npm run test:unit && npm run test:e2e",
    "build": "astro check && astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/mdx": "^4.3.0",
    "@astrojs/sitemap": "^3.6.0",
    "astro": "^6.3.1"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@axe-core/playwright": "^4.10.2",
    "@playwright/test": "^1.55.0",
    "prettier": "^3.6.2",
    "prettier-plugin-astro": "^0.14.1",
    "typescript": "^5.9.2",
    "vitest": "^3.2.4"
  }
}
```

Run `npm install && npx playwright install chromium`. Expected: exit 0 and a lockfile.

- [ ] **Step 2: Write a failing navigation smoke test**

```ts
import { expect, test } from "@playwright/test";

test("homepage exposes research navigation", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Research", "Projects", "Papers", "CV"]) {
    await expect(page.getByRole("link", { name })).toBeVisible();
  }
});
```

Configure Playwright to start `npm run dev -- --host 127.0.0.1` on port 4321,
with Desktop Chrome and Pixel 7 projects. Run `npm run test:e2e -- --project=chromium`.
Expected: FAIL because the site shell does not exist.

- [ ] **Step 3: Add the minimal static site configuration**

```js
// astro.config.mjs
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
export default defineConfig({
  output: "static",
  site: process.env.SITE_URL ?? "http://localhost:4321",
  integrations: [mdx(), sitemap()],
});
```

Extend `astro/tsconfigs/strict`. Create a semantic page with the four tested
links and minimal CSS. Ignore `node_modules/`, `dist/`, `.astro/`,
`playwright-report/`, and `test-results/`.

- [ ] **Step 4: Verify and commit**

Run `npm run check && npm run test:e2e -- --project=chromium && npm run build`.
Expected: exit 0 and `dist/index.html`. Add CI using checkout v4, setup-node v4
with 22.12.0, `npm ci`, Playwright Chromium install, format check, Astro check,
unit tests, browser tests, and build. Commit:

```bash
git add . && git commit -m "chore: bootstrap static Astro site"
```

### Task 2: Define Profile and Research Content Contracts

**Files:**
- Create: `src/data/profile.ts`, `src/content.config.ts`, `src/lib/content.ts`
- Create: `src/content/projects/*.md`, `src/content/publications/*.md`
- Create: `tests/content.test.ts`

**Interfaces:**
- Consumes: owner-approved identity, contact, project, output, and asset facts.
- Produces: `profile`; collections `projects` and `publications`; `filterPublicEntries`, `sortByDateDescending`, `takeFeatured`.

- [ ] **Step 1: Complete the content gate**

Obtain exact public name, headline, affiliation, biographies, contact links, CV,
first project facts, output metadata, rights-cleared images, and custom domain.
Unavailable fields must be omitted. Unapproved entries must be `draft: true`.

- [ ] **Step 2: Write failing selector tests**

Test that a three-entry fixture excludes `draft: true`, sorts newest-first
without mutation, and returns only featured public records. Run
`npm run test:unit`. Expected: FAIL because `src/lib/content.ts` is missing.

- [ ] **Step 3: Implement pure selectors**

```ts
type Entry = { id: string; data: { date: Date; draft: boolean; featured: boolean } };
export const filterPublicEntries = <T extends Entry>(xs: T[]) => xs.filter(x => !x.data.draft);
export const sortByDateDescending = <T extends Entry>(xs: T[]) =>
  [...xs].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
export const takeFeatured = <T extends Entry>(xs: T[], limit: number) =>
  sortByDateDescending(filterPublicEntries(xs)).filter(x => x.data.featured).slice(0, limit);
```

Run `npm run test:unit`. Expected: all selector tests pass.

- [ ] **Step 4: Define Astro Content Layer schemas**

Use `defineCollection`, `glob` from `astro/loaders`, and `z` from `astro/zod`.
Projects require title, summary, date, status, themes, role, featured, draft,
optional collaborators, hero image/alt, and verified external links. Publications
require title, ordered authors, date, type, status, themes, featured, draft,
optional venue/summary, and verified DOI/preprint/code/slides/BibTeX links.
Refine the project schema so `heroAlt` is required whenever `heroImage` exists.

- [ ] **Step 5: Add approved profile and first records**

```ts
export interface Profile {
  name: string;
  headline: string;
  affiliation?: string;
  shortBio: string;
  longBio: string[];
  links: { label: string; href: string }[];
  cvPath?: string;
  domain: string;
}
export function defineProfile(value: Profile): Profile {
  return value;
}
```

Add only verified project/output facts. Run `npm run check && npm run test:unit && npm run build`.
Remove a required field once and confirm validation fails naming the entry; restore it.
Commit `feat: define profile and research content contracts`.

### Task 3: Build the Accessible Shell and Design System

**Files:**
- Create: `src/components/{Header,Footer,Seo}.astro`, `src/layouts/BaseLayout.astro`
- Create: `public/favicon.svg`
- Modify: `src/styles/global.css`, `src/pages/index.astro`, `tests/site.spec.ts`

**Interfaces:**
- Consumes: `profile`.
- Produces: `BaseLayout` props `title`, `description`, optional `image`, `type`, and `jsonLd`.

- [ ] **Step 1: Write failing landmark and keyboard tests**

Assert banner, main, contentinfo, a first-focus “Skip to content” link, and
focus transfer to `#main-content`. Expected: FAIL against the bootstrap page.

- [ ] **Step 2: Implement shared components**

`Header` uses semantic navigation and `aria-current`; `Footer` renders meaningful
text links; `Seo` emits title, description, canonical, Open Graph, Twitter, and
optional JSON-LD. `BaseLayout` includes the skip link and focusable main:

```astro
<a class="skip-link" href="#main-content">Skip to content</a>
<Header />
<main id="main-content" tabindex="-1"><slot /></main>
<Footer />
```

- [ ] **Step 3: Implement the visual system**

Add neutral canvas/ink/surface/border plus one cobalt-teal accent, fluid type
with `clamp()`, 68ch prose measure, responsive container gutters, visible
`:focus-visible`, card/figure/tag/button primitives, header wrapping below 48rem,
and reduced-motion rules. Use local system fonts initially; no remote dependency.

- [ ] **Step 4: Verify and commit**

Run format, Astro check, and Playwright desktop/mobile. Expected: all pass.
Commit `feat: add accessible research site shell`.

### Task 4: Implement the Homepage and Research Narrative

**Files:**
- Create: `src/components/{ProjectCard,PublicationList,ResearchFlow}.astro`
- Create: `src/pages/research.astro`
- Modify: `src/pages/index.astro`, `tests/site.spec.ts`

**Interfaces:**
- Consumes: profile, public collections, `takeFeatured`, shared layout.
- Produces: homepage thesis and `/research` data-to-insight narrative.

- [ ] **Step 1: Write failing tests**

Assert a single h1, “Research interests,” zero draft markers, and `/research`
text for First-principles data, Learned potentials, Molecular simulation, and
Physical insight. Expected: FAIL.

- [ ] **Step 2: Build semantic content components**

`ResearchFlow` is an ordered list with CSS connectors, not canvas/JavaScript.
`ProjectCard` is an article with verified title, summary, themes, status, and one
descriptive link. `PublicationList` preserves author order, uses `<cite>`, and
renders only present links.

- [ ] **Step 3: Compose pages**

Home order: hero; three approved research themes; up to three featured public
projects; up to three public outputs (omit if empty); approved contact/status.
Research connects first-principles data, learned potentials, MD,
electrochemical interfaces, validation, and physical interpretation using only
owner-approved claims.

- [ ] **Step 4: Verify and commit**

Run check, unit tests, focused browser tests, and build. Expected: exit 0 and no
draft content. Commit `feat: add research narrative and homepage`.

### Task 5: Implement Project Index and Case Studies

**Files:**
- Create: `src/components/Figure.astro`
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[id].astro`
- Modify: `tests/site.spec.ts`

**Interfaces:**
- Consumes: project collection, `ProjectCard`, Astro `render()`.
- Produces: `/projects` and static `/projects/{id}` for every public project.

- [ ] **Step 1: Write a failing route test**

Open `/projects`, follow the first project, and assert headings Scientific
question, Approach, Validation and results, and Reproducibility. If no project
is approved, require an honest empty state and no draft title. Expected: FAIL.

- [ ] **Step 2: Implement list and static routes**

```astro
export async function getStaticPaths() {
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  return projects.map(project => ({ params: { id: project.id }, props: { project } }));
}
const { Content } = await render(Astro.props.project);
```

Render role, methods, results, reproducibility, links, and `<Content />`; never
generate a route for a draft.

- [ ] **Step 3: Add the figure contract**

`Figure.astro` requires `src`, nonempty `alt`, `caption`, `width`, and `height`;
render `<figure>`, lazy image with explicit dimensions, and `<figcaption>`.

- [ ] **Step 4: Verify and commit**

Run check, project browser tests, and build. Confirm no draft folder in
`dist/projects`. Commit `feat: add research project case studies`.

### Task 6: Implement Papers, About, CV, and 404

**Files:**
- Create: `src/pages/{papers,about,cv,404}.astro`
- Add when supplied: `public/cv/cv.pdf`
- Modify: `tests/site.spec.ts`

**Interfaces:**
- Consumes: profile, publications, `PublicationList`, approved CV.
- Produces: `/papers`, `/about`, `/cv`, PDF link when supplied, and `404.html`.

- [ ] **Step 1: Write failing page tests**

Assert papers grouped by descending year with no drafts; approved About copy
without vanity counters; valid CV download or approved no-download state; and a
branded missing-page response. Expected: FAIL.

- [ ] **Step 2: Implement the pages**

Group public outputs by UTC year and render static lists. Add filter controls
only with at least eight entries and two useful values. About contains approved
biography, trajectory, and methods—not a skill cloud. CV links the supplied PDF
or omits the button. The 404 links Home, Research, Projects, and Papers.

- [ ] **Step 3: Verify and commit**

Run check, focused browser tests, and build. Expected: PDF 200 when configured
and `dist/404.html` exists. Commit `feat: add papers profile and CV pages`.

### Task 7: Add Structured Data, Crawl Controls, and Accessibility Checks

**Files:**
- Create: `src/lib/structured-data.ts`, `tests/structured-data.test.ts`, `public/robots.txt`
- Modify: `src/components/Seo.astro`, relevant pages, `tests/site.spec.ts`

**Interfaces:**
- Produces: `buildPersonJsonLd(profile)` and `buildScholarlyArticleJsonLd(entry, url)`.

- [ ] **Step 1: Write failing JSON-LD tests**

Assert Person context/type/name/url and non-email `sameAs`. Assert scholarly
data omits publication date and venue container unless status and venue support
them. Expected: FAIL.

- [ ] **Step 2: Implement conservative builders**

Use pure functions, map author names to Person objects, serialize no undefined
values, and use ScholarlyArticle only for journal/conference/preprint records.
Run unit tests; expected PASS.

- [ ] **Step 3: Add crawl and accessibility coverage**

Add Person data to Home/About. Set robots sitemap to the exact confirmed domain.
Scan Home, Research, Projects, Papers, About, and CV with Axe and require zero
violations. Test 320px overflow, nonempty research-image alt, heading order, and
reduced-motion visibility.

- [ ] **Step 4: Verify and commit**

Run `npm run format:check && npm run check && npm run test && npm run build`.
Expected: all exit 0. Commit `feat: add discoverability and accessibility checks`.

### Task 8: Production Verification and Cloudflare Preview

**Files:**
- Create: `README.md`
- Modify: `astro.config.mjs`, `.github/workflows/ci.yml` with confirmed domain.

**Interfaces:**
- Produces: documented maintenance, passing production checks, PR, and preview URL.

- [ ] **Step 1: Document maintenance and deployment**

Create `README.md` with Node/npm setup, all verification commands, instructions
for adding typed projects and outputs, draft behavior, CV/image replacement,
the `SITE_URL` variable, and Cloudflare's `npm run build` command with `dist`
output.

- [ ] **Step 2: Run the complete production suite**

```bash
npm ci
npm run format:check
npm run check
npm run test:unit
npm run test:e2e
SITE_URL="https://the-confirmed-production-domain" npm run build
```

Replace the final command's URL with the exact domain approved in Task 2 before
running it. Expected: every command exits 0; the build contains the sitemap,
robots file, 404 page, canonical URLs, and structured data using that domain.

- [ ] **Step 3: Perform production-like browser verification**

Serve `dist` with `npm run preview -- --host 127.0.0.1`. Check desktop and
mobile navigation, keyboard-only use, 200% zoom, 320px layout, every local and
external link, CV download, canonical tags, JSON-LD, console errors, and failed
asset requests. Run Lighthouse against Home, Research, one public project, and
Papers; correct any Performance, Accessibility, Best Practices, or SEO score
below 95.

- [ ] **Step 4: Commit and open review**

```bash
git add README.md astro.config.mjs .github/workflows/ci.yml
git commit -m "docs: add website maintenance and deployment guide"
git push -u origin feature/personal-research-website
```

Open a pull request into `main` and require CI to pass.

- [ ] **Step 5: Create a Cloudflare Pages preview**

Connect only `rdyu-cm/personal-website`; set production branch `main`, build
command `npm run build`, output `dist`, Node 22.12 or newer, the approved
`SITE_URL`, and preview builds for the feature branch. Expected: a successful
Cloudflare check and preview URL on the pull request. Do not connect DNS.

- [ ] **Step 6: Merge only after explicit approval**

After the user approves both pull request and preview, merge into `main`, rerun
the full suite on the merged result, and confirm the Cloudflare production
deployment. Request separate approval before changing custom-domain or DNS
records. Remove the worktree and feature branch only after the merged deployment
is verified.
