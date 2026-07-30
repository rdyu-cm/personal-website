# Research Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a concise four-page research profile with editable Markdown content and an accessible twilight-violet big-tech-inspired interface.

**Architecture:** Keep Astro's static route and content-collection architecture. Replace the project-oriented public model with a `research` collection, add a singleton `about` collection, broaden publication types to include presentations, and keep templates focused on rendering. Shared shell components and global OKLCH tokens provide the visual system; page-local styles handle only page-specific composition.

**Tech Stack:** Astro 6, TypeScript 5.9, Astro content collections with Zod, Vitest, Playwright, Axe.

## Global Constraints

- Public navigation contains exactly Home, Research, Publications & Presentations, and About.
- Use `/publications` as the canonical output route; do not publish Projects routes.
- Keep all user-editable descriptions in `src/data/profile.ts` or Markdown under `src/content`.
- Use a deep twilight-violet canvas, soft lavender ink, pastel pink primary accent, and pale cyan secondary accent expressed as OKLCH tokens.
- Body text contrast is at least 4.5:1; large text contrast is at least 3:1.
- Do not add React, another UI framework, an animation dependency, a CMS, or a résumé parser.
- Do not fabricate research, publication, presentation, résumé, or biographical content.
- Preserve Person and ScholarlyArticle structured data where semantically valid.
- Preserve the private résumé ignore rule; expose a CV only after the user supplies and authorizes a public asset.
- Support a 320px viewport, keyboard navigation, visible focus, and `prefers-reduced-motion`.

## File Structure

- `src/content.config.ts`: schemas for research, publications/presentations, and singleton About content.
- `src/content/research/*.md`: editable research appointments migrated from current project records.
- `src/content/about/about.md`: manually authored About copy.
- `src/data/profile.ts`: structured identity, homepage thesis, affiliation, dates, and external links.
- `src/components/Header.astro`, `Footer.astro`: four-route shared navigation and contact shell.
- `src/components/ResearchList.astro`: reusable compact research rows for Home.
- `src/components/PublicationList.astro`: open, ruled output rows with type labels.
- `src/pages/index.astro`: concise professional overview.
- `src/pages/research.astro`: detailed research appointment rendering.
- `src/pages/publications.astro`: canonical combined output index.
- `src/pages/about.astro`: singleton Markdown About rendering.
- `src/styles/global.css`: twilight-violet tokens, global typography, layout, accessibility, and motion.
- `tests/content.test.ts`: schema, content, privacy, and editable-source regression tests.
- `tests/site.spec.ts`: route, navigation, content, accessibility, responsive, and reduced-motion checks.
- `tests/structured-data.test.ts`, `tests/seo.test.ts`: semantic metadata regression checks.

---

### Task 1: Establish the editable content model

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/data/profile.ts`
- Create: `src/content/research/rotskoff-protein-representations.md`
- Create: `src/content/research/nitrate-reduction-electrolytes.md`
- Create: `src/content/research/smoothened-gi.md`
- Create: `src/content/about/about.md`
- Modify: `src/content/publications/smoothened-ligand-activation.md`
- Modify: `tests/content.test.ts`

**Interfaces:**
- Produces: Astro collections named `"research"`, `"publications"`, and `"about"`.
- Produces: `profile.homepageSummary: string`, `profile.affiliation?: string`, and existing `profile.links`.
- Produces: research fields `title`, `lab`, `institution`, `date`, `datePrecision`, `status`, `summary`, `methods`, `featured`, `draft`, and optional `links`.
- Consumes: existing verified content from `src/content/projects/*.md`; no new factual claims.

- [ ] **Step 1: Replace schema-source assertions with failing tests for the new collections**

```ts
test("defines research, publication, and singleton about collections", () => {
  const schema = readSource("src/content.config.ts");
  expect(schema).toContain("const research = defineCollection");
  expect(schema).toContain('base: "./src/content/research"');
  expect(schema).toContain('type: z.enum(["journal", "conference", "preprint", "manuscript", "poster", "talk", "presentation"])');
  expect(schema).toContain("const about = defineCollection");
  expect(schema).toContain("export const collections = { research, publications, about }");
});

test("keeps editable descriptions out of page templates", () => {
  expect(readSource("src/content/about/about.md")).toContain("Ryan Yu");
  for (const id of [
    "rotskoff-protein-representations",
    "nitrate-reduction-electrolytes",
    "smoothened-gi",
  ]) {
    expect(readSource(`src/content/research/${id}.md`)).toContain("summary:");
  }
});
```

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run: `npm run test:unit -- tests/content.test.ts`  
Expected: FAIL because the research/about collections and files do not exist.

- [ ] **Step 3: Define the collections and migrate verified content**

Use this schema shape in `src/content.config.ts`:

```ts
const research = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/research" }),
  schema: z.object({
    title: z.string().trim().min(1),
    lab: z.string().trim().min(1),
    institution: z.string().trim().min(1),
    date: z.coerce.date(),
    datePrecision: z.enum(["year", "month", "day"]),
    status: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    methods: z.array(z.string().trim().min(1)).min(1),
    featured: z.boolean(),
    draft: z.boolean(),
    links: externalLinksSchema.optional(),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: "about.md", base: "./src/content/about" }),
  schema: z.object({ title: z.string().trim().min(1) }),
});
```

Extend the publication `type` enum exactly as asserted. Copy each current
project's verified summary and body into the corresponding research Markdown,
adding its known lab and institution. Add `homepageSummary` to `Profile` and
move the approved current hero thesis into that property. Put only existing
biographical prose into `src/content/about/about.md`; do not automatically list
appointments there.

- [ ] **Step 4: Run content tests and Astro validation**

Run: `npm run test:unit -- tests/content.test.ts && npm run check`  
Expected: PASS with no schema or TypeScript errors.

- [ ] **Step 5: Commit the content model**

```bash
git add src/content.config.ts src/data/profile.ts src/content/research src/content/about src/content/publications tests/content.test.ts
git commit -m "refactor: establish editable research content"
```

### Task 2: Build the four-route shell and twilight-violet visual system

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/site.spec.ts`

**Interfaces:**
- Consumes: `profile.name`, `profile.headline`, and `profile.links`.
- Produces: global tokens `--canvas`, `--surface`, `--surface-strong`, `--ink`, `--ink-muted`, `--border`, `--primary`, `--primary-strong`, `--accent`, and `--focus`.
- Produces: canonical navigation hrefs `/`, `/research`, `/publications`, `/about`.

- [ ] **Step 1: Write the failing navigation and theme tests**

```ts
test("primary navigation exposes the four-page research profile", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  for (const [name, href] of [
    ["Home", "/"],
    ["Research", "/research"],
    ["Publications & Presentations", "/publications"],
    ["About", "/about"],
  ]) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
  await expect(nav.getByRole("link", { name: "Projects" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Papers" })).toHaveCount(0);
});

test("uses softened twilight colors instead of white on black", async ({ page }) => {
  await page.goto("/");
  const colors = await page.locator("body").evaluate((body) => {
    const style = getComputedStyle(body);
    return { color: style.color, background: style.backgroundColor };
  });
  expect(colors.color).not.toBe("rgb(255, 255, 255)");
  expect(colors.background).not.toBe("rgb(0, 0, 0)");
});
```

- [ ] **Step 2: Run the browser tests and confirm the navigation assertion fails**

Run: `npm run test:e2e -- --grep "four-page|softened twilight"`  
Expected: FAIL because Projects and Papers remain in navigation.

- [ ] **Step 3: Implement the shared shell and global tokens**

Set the navigation array to:

```ts
const navigation = [
  { label: "Home", href: toRoute("/") },
  { label: "Research", href: toRoute("/research") },
  { label: "Publications & Presentations", href: toRoute("/publications") },
  { label: "About", href: toRoute("/about") },
];
```

Start the global palette with contrast-verified OKLCH values and tune only toward
greater contrast:

```css
:root {
  color-scheme: dark;
  --canvas: oklch(0.22 0.055 292);
  --surface: oklch(0.27 0.06 292);
  --surface-strong: oklch(0.33 0.07 292);
  --ink: oklch(0.91 0.025 295);
  --ink-muted: oklch(0.78 0.035 295);
  --border: oklch(0.46 0.065 292);
  --primary: oklch(0.79 0.09 335);
  --primary-strong: oklch(0.86 0.075 335);
  --accent: oklch(0.82 0.07 205);
  --focus: oklch(0.88 0.09 205);
}
```

Update `theme-color`, header spacing, focus states, global type scale, and
reduced-motion rules. Do not add a hamburger menu for four links; allow an
accessible wrapped or horizontally scrollable small-screen layout.

- [ ] **Step 4: Run focused browser and accessibility checks**

Run: `npm run test:e2e -- --grep "four-page|softened twilight|Axe|overflow"`  
Expected: PASS on Chromium and Pixel 7 projects.

- [ ] **Step 5: Commit the shell**

```bash
git add src/components/Header.astro src/components/Footer.astro src/layouts/BaseLayout.astro src/styles/global.css tests/site.spec.ts
git commit -m "feat: add twilight research site shell"
```

### Task 3: Rebuild Home as a concise research profile

**Files:**
- Create: `src/components/ResearchList.astro`
- Modify: `src/pages/index.astro`
- Modify: `tests/site.spec.ts`
- Modify: `tests/structured-data.test.ts`

**Interfaces:**
- Consumes: `CollectionEntry<"research">[]`, `profile.homepageSummary`, `profile.affiliation`, and newest featured publications.
- Produces: `ResearchList` prop `{ research: CollectionEntry<"research">[] }`.
- Preserves: Person JSON-LD from `buildPersonJsonLd`.

- [ ] **Step 1: Replace the old homepage expectations with a failing concise-home test**

```ts
test("homepage presents identity, three research rows, and latest outputs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Ryan Yu" })).toHaveCount(1);
  await expect(page.getByText("California Institute of Technology", { exact: true })).toBeVisible();
  await expect(page.getByRole("list", { name: "Current research" }).getByRole("listitem")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Latest publications & presentations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Research interests" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Selected projects" })).toHaveCount(0);
});
```

- [ ] **Step 2: Run the homepage test and confirm it fails**

Run: `npm run test:e2e -- --grep "identity, three research rows"`  
Expected: FAIL on the old duplicated sections.

- [ ] **Step 3: Implement ResearchList and the new Home composition**

Query public featured research with `takeFeatured(await
getCollection("research"), 3)`. Render semantic `<ol aria-label="Current
research">` rows with title, lab/institution, formatted date, summary, and an
anchor to `/research#${entry.id}`. Rebuild the hero with the profile facts,
Research and LinkedIn actions, and this decorative element:

```astro
<div class="hero-orbit" aria-hidden="true"><span></span></div>
```

Implement the orbit with layered radial gradients and pseudo-elements, not an
SVG illustration. It must collapse behind or below copy on small screens and
must never overlap interactive elements. Render at most three newest featured
outputs and remove the old interests, project-card, and workflow copy.

- [ ] **Step 4: Run homepage, structured-data, and accessibility checks**

Run: `npm run test:unit -- tests/structured-data.test.ts && npm run test:e2e -- --grep "homepage|Axe|overflow|reduced motion"`  
Expected: PASS.

- [ ] **Step 5: Commit Home**

```bash
git add src/components/ResearchList.astro src/pages/index.astro tests/site.spec.ts tests/structured-data.test.ts
git commit -m "feat: rebuild concise research homepage"
```

### Task 4: Render detailed Research and manual About content

**Files:**
- Modify: `src/pages/research.astro`
- Modify: `src/pages/about.astro`
- Delete: `src/components/ResearchFlow.astro`
- Modify: `tests/site.spec.ts`

**Interfaces:**
- Consumes: public `"research"` entries sorted newest first.
- Consumes: the singleton `"about"` entry rendered through Astro's `render`.
- Preserves: About Person JSON-LD.

- [ ] **Step 1: Write failing tests for the focused Research and manual About pages**

```ts
test("research page renders three editable appointments without workflow scaffolding", async ({ page }) => {
  await page.goto("/research");
  await expect(page.locator(".research-entry")).toHaveCount(3);
  for (const lab of ["Rotskoff Lab", "Fong Lab", "Goddard Lab"]) {
    await expect(page.getByText(lab, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("list", { name: "Research workflow" })).toHaveCount(0);
});

test("about page renders only the manually authored article", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("article", { name: "About Ryan Yu" })).toBeVisible();
  await expect(page.getByText("Research appointments", { exact: true })).toHaveCount(0);
});
```

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run: `npm run test:e2e -- --grep "editable appointments|manually authored"`  
Expected: FAIL because ResearchFlow and generated About sections remain.

- [ ] **Step 3: Implement collection-driven Research and singleton About**

Use:

```ts
const research = sortByDateDescending(
  filterPublicEntries(await getCollection("research")),
);
const [about] = await getCollection("about");
if (!about) throw new Error("Expected src/content/about/about.md");
const { Content } = await render(about);
```

Render each research record as `<article class="research-entry"
id={entry.id}>`, with a metadata column, summary, Markdown body, and methods
list. Render About as one labelled `<article>` containing `<Content />`.
Delete `ResearchFlow.astro` after removing all imports.

- [ ] **Step 4: Run Research, About, JSON-LD, accessibility, and responsive checks**

Run: `npm run test:e2e -- --grep "research page|about page|Person JSON-LD|Axe|overflow"`  
Expected: PASS.

- [ ] **Step 5: Commit Research and About**

```bash
git add src/pages/research.astro src/pages/about.astro src/components/ResearchFlow.astro tests/site.spec.ts
git commit -m "feat: focus research and about pages"
```

### Task 5: Replace Papers and Projects with Publications & Presentations

**Files:**
- Create: `src/pages/publications.astro`
- Modify: `src/components/PublicationList.astro`
- Delete: `src/pages/papers.astro`
- Delete: `src/pages/projects/index.astro`
- Delete: `src/pages/projects/[id].astro`
- Delete: `src/components/ProjectCard.astro`
- Modify: `src/lib/structured-data.ts`
- Modify: `tests/site.spec.ts`
- Modify: `tests/seo.test.ts`
- Modify: `tests/structured-data.test.ts`

**Interfaces:**
- Consumes: sorted public `"publications"` entries.
- Produces: output rows with `data-publication-type`, a visible normalized type label, and existing external links.
- Preserves: `buildScholarlyArticleJsonLd` returns no ScholarlyArticle for `poster`, `talk`, or `presentation`.

- [ ] **Step 1: Write failing route and semantic-output tests**

```ts
test("publications route combines publications and presentations", async ({ page }) => {
  await page.goto("/publications");
  await expect(page.getByRole("heading", { level: 1, name: "Publications & Presentations" })).toBeVisible();
  await expect(page.locator(".publication-item").first()).toBeVisible();
});

test("obsolete project and papers routes are not public pages", async ({ page }) => {
  for (const path of ["/papers", "/projects", "/projects/smoothened-gi"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  }
});
```

Add a unit assertion that `buildScholarlyArticleJsonLd` returns `undefined` for
an otherwise valid entry whose `type` is `"talk"`.

- [ ] **Step 2: Run focused tests and confirm they fail**

Run: `npm run test:unit -- tests/structured-data.test.ts && npm run test:e2e -- --grep "publications route|obsolete project"`  
Expected: FAIL because `/publications` does not exist and old routes still render.

- [ ] **Step 3: Implement the canonical output route and remove obsolete templates**

Move the year grouping and conditional filtering logic from `papers.astro` to
`publications.astro`, update all visible labels and metadata, and render a type
label in `PublicationList.astro`:

```astro
<span class="publication-type">
  {publication.data.type === "journal" ? "Publication" : publication.data.type}
</span>
```

Use CSS text transformation only for presentation; keep accessible text
meaningful. Update structured-data eligibility to the scholarly types
`journal`, `conference`, `preprint`, and `manuscript`. Remove public project
templates and `ProjectCard.astro`; retain no dead imports.

- [ ] **Step 4: Run route, metadata, accessibility, and 404 checks**

Run: `npm run test:unit -- tests/seo.test.ts tests/structured-data.test.ts && npm run test:e2e -- --grep "publications|obsolete|missing routes|Axe"`  
Expected: PASS.

- [ ] **Step 5: Commit route consolidation**

```bash
git add src/pages src/components/PublicationList.astro src/components/ProjectCard.astro src/lib/structured-data.ts tests/site.spec.ts tests/seo.test.ts tests/structured-data.test.ts
git commit -m "feat: consolidate publications and presentations"
```

### Task 6: Finish metadata, repository cleanup, and visual verification

**Files:**
- Modify: `src/components/Seo.astro` if route copy requires it
- Modify: `src/pages/404.astro`
- Modify: `public/favicon.svg`
- Modify: `public/social-preview.png` via `npm run social-preview`
- Modify: `scripts/render-social-preview.mjs`
- Modify: `README.md`
- Modify: `tests/repository.test.ts`
- Modify: `tests/site.spec.ts`
- Delete: `src/content/projects/*.md`

**Interfaces:**
- Consumes: final four-route information architecture and twilight tokens.
- Produces: coherent favicon, theme color, social preview, 404 links, and editing documentation.

- [ ] **Step 1: Add failing repository and obsolete-label assertions**

```ts
test("does not ship obsolete site labels or project content", () => {
  const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" });
  expect(tracked).not.toContain("src/content/projects/");
  for (const file of ["src/pages/index.astro", "src/components/Header.astro", "src/pages/404.astro"]) {
    expect(readFileSync(resolve(root, file), "utf8")).not.toMatch(/Research outputs|>Papers<|>Projects</);
  }
});
```

- [ ] **Step 2: Run the repository test and confirm it fails**

Run: `npm run test:unit -- tests/repository.test.ts`  
Expected: FAIL while old project Markdown and labels remain.

- [ ] **Step 3: Remove obsolete content and align final brand assets**

Delete `src/content/projects/*.md` only after the research migration is verified.
Update the 404 page to link only to the four public routes. Update README's
content-editing section to point to `profile.ts`, `content/research`,
`content/publications`, and `content/about/about.md`. Adjust the favicon and
social-preview renderer to use the twilight-violet, pastel-pink, and pale-cyan
palette, then run:

```bash
npm run social-preview
```

Do not add a CV link or copy the ignored résumé into `public/`.

- [ ] **Step 4: Run complete automated verification**

Run: `npm run format && npm run format:check && npm run check && npm run test && npm run build`  
Expected: all formatter, Astro,  unit,  browser, accessibility, and production-build checks pass.

- [ ] **Step 5: Perform desktop and mobile visual checks**

Run the dev server and inspect `/`, `/research`, `/publications`, `/about`, and
`/404` at 1440×900 and 390×844. Confirm:

- hero spacing is generous and the orbit does not overlap copy
- lavender body copy is comfortable against the violet canvas
- pink and cyan accents remain restrained
- research and output rows align on desktop and stack cleanly on mobile
- navigation is usable at 320px
- keyboard focus is visible
- reduced motion leaves all content visible

Capture screenshots under `output/playwright/` for the implementation review;
do not commit those artifacts.

- [ ] **Step 6: Commit final polish**

```bash
git add src public scripts README.md tests
git commit -m "chore: finish research site redesign"
```

- [ ] **Step 7: Review the complete branch diff**

Run: `git status --short --branch && git diff --check main...HEAD && git log --oneline main..HEAD`  
Expected: clean worktree, no whitespace errors, and focused commits for content,
shell, Home, Research/About, outputs, and final polish.
