# Dark Research Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a compact Deep Orbit research portfolio with current Rotskoff, Fong, and Goddard work, the published PNAS paper, LinkedIn, and no public CV.

**Architecture:** Keep Astro's static output, typed content collections, shared profile data, and Workers Static Assets deployment unchanged. Update data before presentation, then apply centralized dark tokens and focused page-level layouts; all public behavior is covered by Vitest source/content checks and Playwright accessibility and route checks.

**Tech Stack:** Astro 6, TypeScript 5.9, Astro content collections, CSS/OKLCH, Vitest, Playwright, Axe, Wrangler Workers Static Assets

## Global Constraints

- Preserve static Astro output, Workers Static Assets, `SITE_URL`, and the canonical Worker fallback.
- Add no runtime or external font dependency and no client JavaScript beyond the existing conditional papers filter.
- Publish no resume PDF, phone number, private research data, model output, trajectory, unpublished figure, or scientific interactive.
- Use the five-item navigation in this order: Home, Research, Projects, Papers, About.
- Use `https://www.linkedin.com/in/ryan-yu-0bb27a23b` for LinkedIn.
- Normal text must meet WCAG AA 4.5:1 contrast and the layout must not overflow at 320px.
- Respect `prefers-reduced-motion: reduce`; do not hide content behind animation.
- Keep display letter spacing at or above `-0.04em`, body copy near `1rem–1.0625rem`, and H1 near `2.75rem–4rem`.
- Treat the approved design spec at `docs/superpowers/specs/2026-07-29-dark-research-redesign-design.md` as the source of truth.

---

## File Structure

- `src/data/profile.ts`: shared identity, biography, and public contact/profile links.
- `src/content/projects/rotskoff-protein-representations.md`: new typed Rotskoff research record.
- `src/content/projects/nitrate-reduction-electrolytes.md`: current Fong wording and dates.
- `src/content/projects/smoothened-gi.md`: current Goddard wording and dates.
- `src/content/publications/smoothened-ligand-activation.md`: published PNAS metadata and DOI.
- `src/components/Header.astro`: five-item navigation.
- `src/components/Footer.astro`: profile-driven public links and compact dark footer.
- `src/styles/global.css`: Deep Orbit tokens, compact type/spacing scale, shell, focus, cards, tags, and motion fallback.
- `src/pages/index.astro`: identity-first hero, two tags, and prominent three-row Current Research band.
- `src/pages/research.astro`: Rotskoff-first research tracks and compact workflow.
- `src/pages/projects/index.astro`: compact project index presentation.
- `src/pages/projects/[id].astro`: compact project-detail presentation.
- `src/pages/papers.astro`: compact published-output presentation.
- `src/pages/about.astro`: updated trajectory and appointments.
- `src/pages/cv.astro`: deleted so `/cv` uses the branded 404.
- `tests/content.test.ts`: content record, ordering, DOI, profile link, and resume-ignore regression checks.
- `tests/structured-data.test.ts`: published scholarly metadata regression checks.
- `tests/site.spec.ts`: navigation, research rows, project routes, paper metadata, CV removal, accessibility, heading, overflow, and reduced-motion checks.

---

### Task 1: Current Public Research Record

**Files:**
- Create: `src/content/projects/rotskoff-protein-representations.md`
- Modify: `src/data/profile.ts`
- Modify: `src/content/projects/nitrate-reduction-electrolytes.md`
- Modify: `src/content/projects/smoothened-gi.md`
- Modify: `src/content/publications/smoothened-ligand-activation.md`
- Test: `tests/content.test.ts`
- Test: `tests/structured-data.test.ts`

**Interfaces:**
- Consumes: existing `projects` and `publications` schemas from `src/content.config.ts`.
- Produces: `profile.links` containing Email, GitHub, and LinkedIn; three public featured projects sorted Rotskoff, Fong, Goddard; one 2026 published journal record with a DOI.

- [ ] **Step 1: Write failing content and metadata tests**

Add source-backed assertions to `tests/content.test.ts`:

```ts
describe("current public research record", () => {
  test("publishes the three current research projects in newest-first order", () => {
    const records = [
      "src/content/projects/rotskoff-protein-representations.md",
      "src/content/projects/nitrate-reduction-electrolytes.md",
      "src/content/projects/smoothened-gi.md",
    ].map(readSource);

    expect(records[0]).toContain("date: 2026-06-01");
    expect(records[0]).toContain("BioEmu and ESM3");
    expect(records[1]).toContain("date: 2024-12-01");
    expect(records[1]).toContain("LAMMPS and CP2K");
    expect(records[2]).toContain("date: 2023-12-01");
    expect(records[2]).toContain("GROMACS and PLUMED");
  });

  test("publishes the PNAS article and DOI", () => {
    const publication = readSource(
      "src/content/publications/smoothened-ligand-activation.md",
    );

    expect(publication).toContain('type: "journal"');
    expect(publication).toContain('status: "Published"');
    expect(publication).toContain("date: 2026-01-01");
    expect(publication).toContain(
      'venue: "Proceedings of the National Academy of Sciences"',
    );
    expect(publication).toContain(
      'doi: "https://doi.org/10.1073/pnas.2604658123"',
    );
  });

  test("adds LinkedIn and keeps private contact fields absent", () => {
    const profile = readSource("src/data/profile.ts");

    expect(profile).toContain(
      "https://www.linkedin.com/in/ryan-yu-0bb27a23b",
    );
    expect(profile).not.toMatch(/\b\d{3}[-.)\s]\d{3}[-.]\d{4}\b/);
    expect(profile).not.toContain("cvPath");
  });
});
```

Update the schema record loop to include the new Rotskoff record and expect `datePrecision: month` for all three projects:

```ts
for (const record of [
  "src/content/projects/rotskoff-protein-representations.md",
  "src/content/projects/smoothened-gi.md",
  "src/content/projects/nitrate-reduction-electrolytes.md",
]) {
  expect(readSource(record)).toContain("datePrecision: month");
}
expect(
  readSource("src/content/publications/smoothened-ligand-activation.md"),
).toContain("datePrecision: year");
```

In `tests/structured-data.test.ts`, update the publication fixture or source expectations to assert:

```ts
expect(article).toMatchObject({
  "@type": "ScholarlyArticle",
  datePublished: "2026",
  isPartOf: {
    "@type": "Periodical",
    name: "Proceedings of the National Academy of Sciences",
  },
  sameAs: "https://doi.org/10.1073/pnas.2604658123",
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
npm run test:unit -- tests/content.test.ts tests/structured-data.test.ts
```

Expected: FAIL because the Rotskoff file and LinkedIn link do not exist and the publication is still a submitted 2025 manuscript.

- [ ] **Step 3: Update shared profile and typed research content**

Remove `cvPath?: string` from `Profile`, add LinkedIn to `links`, and set the profile copy to:

```ts
headline: "Chemical Engineering Undergraduate · AI for Science",
shortBio:
  "Caltech Chemical Engineering (Computational) undergraduate working across interpretable protein representations, machine-learned interatomic potentials, and molecular simulation.",
longBio: [
  "Ryan Yu is a Chemical Engineering (Computational) undergraduate at the California Institute of Technology, studying from 2023 to 2027.",
  "In the Rotskoff Lab at Stanford, Ryan trains sparse autoencoders on BioEmu and ESM3 representations to identify interpretable features of protein structure and conformational distributions.",
  "At Caltech, Ryan develops machine-learned interatomic potentials for nitrate-reduction electrolytes in the Fong Lab and studies the Smoothened activation mechanism with molecular dynamics and metadynamics in the Goddard Lab.",
],
links: [
  { label: "Email", href: "mailto:rdyu@caltech.edu" },
  { label: "GitHub", href: "https://github.com/rdyu-cm" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ryan-yu-0bb27a23b",
  },
],
```

Create `src/content/projects/rotskoff-protein-representations.md`:

```md
---
title: "Interpretable protein representations"
summary: "Sparse autoencoders for interpretable structural and conformational-distribution features in BioEmu and ESM3 protein representations."
date: 2026-06-01
datePrecision: month
status: "Ongoing · Rotskoff Lab, Stanford University"
themes:
  - "AI for science"
  - "Sparse autoencoders"
  - "Protein representations"
role: "Student Researcher"
featured: true
draft: false
---

In the Rotskoff Lab, I train sparse autoencoders on BioEmu and ESM3 representations to extract interpretable features corresponding to structural and conformational-distribution properties in proteins.
```

Update the Fong frontmatter to `date: 2024-12-01`, `datePrecision: month`, and:

```md
summary: "Molecular dynamics and density functional theory calculations in LAMMPS and CP2K for a MACE machine-learned interatomic potential at nitrate-reduction interfaces."
status: "Ongoing · Fong Lab, Caltech"
role: "Student Researcher"
```

Replace its body with:

```md
In the Fong Lab, I conduct molecular dynamics and density functional theory calculations in LAMMPS and CP2K to train a MACE machine-learned interatomic potential for the interfacial environment in electrochemical nitrate reduction. The work includes aqueous nitrate and alkali-cation electrolytes and the TiH2/electrolyte interface.
```

Update the Goddard frontmatter to `date: 2023-12-01`, `datePrecision: month`, status `Ongoing · Goddard Lab, Caltech`, role `Student Researcher`, and:

```md
summary: "Molecular dynamics and metadynamics study of the precoupled state and ligand-activation mechanism of Smoothened."
resultSummary: "This work determined a precoupled Smoothened–Gi state and the mechanism for ligand activation of Smoothened."
```

Replace its body with:

```md
In the Goddard Lab, I modeled the oncoprotein Smoothened with molecular dynamics and metadynamics in GROMACS and PLUMED. This work determined the precoupled state and the mechanism for ligand activation of Smoothened.
```

Replace the publication frontmatter and body with:

```md
---
title: "The Mechanism for Ligand Activation of the Smoothened G Protein-Coupled Receptor"
authors:
  - "Ryan D. Yu"
  - "Amy-Doan P. Vo"
  - "Soo-Kyung Kim"
  - "William A. Goddard III"
date: 2026-01-01
datePrecision: year
type: "journal"
status: "Published"
themes:
  - "Molecular simulation"
  - "G protein-coupled receptors"
featured: true
draft: false
venue: "Proceedings of the National Academy of Sciences"
summary: "Molecular simulation study of a G-protein-first pathway for ligand activation of the Smoothened G protein-coupled receptor."
links:
  doi: "https://doi.org/10.1073/pnas.2604658123"
---

Published in the Proceedings of the National Academy of Sciences, 2026.
```

- [ ] **Step 4: Run focused tests and content build**

Run:

```bash
npm run test:unit -- tests/content.test.ts tests/structured-data.test.ts
npm run build
```

Expected: both commands PASS; Astro generates three public project routes and the 2026 paper record.

- [ ] **Step 5: Commit the public record update**

```bash
git add src/data/profile.ts src/content/projects src/content/publications tests/content.test.ts tests/structured-data.test.ts
git commit -m "feat: update public research record"
```

---

### Task 2: Deep Orbit Shell and CV Removal

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/styles/global.css`
- Delete: `src/pages/cv.astro`
- Test: `tests/site.spec.ts`

**Interfaces:**
- Consumes: `profile.name`, `profile.headline`, and `profile.links`.
- Produces: a five-link dark shared shell, compact type tokens, visible focus behavior, reduced-motion fallback, and no generated `/cv` route.

- [ ] **Step 1: Write failing shell and CV browser tests**

Replace the navigation expectation in `tests/site.spec.ts` with:

```ts
for (const [name, href] of [
  ["Home", "/"],
  ["Research", "/research"],
  ["Projects", "/projects"],
  ["Papers", "/papers"],
  ["About", "/about"],
]) {
  await expect(
    navigation.getByRole("link", { name, exact: true }),
  ).toHaveAttribute("href", href);
}
await expect(
  navigation.getByRole("link", { name: "CV", exact: true }),
).toHaveCount(0);
```

Replace the CV test with:

```ts
test("CV route uses the branded not-found page without private contact data", async ({
  page,
}) => {
  const response = await page.goto("/cv");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(
    /\b\d{3}[-.)\s]\d{3}[-.]\d{4}\b/,
  );
});
```

Keep `/cv` in `auditedPaths` so Axe, headings, and 320px overflow cover the branded 404.

- [ ] **Step 2: Run the browser tests and verify failure**

Run:

```bash
npm run test:e2e -- --grep "primary navigation|CV route"
```

Expected: FAIL because CV is still present in navigation and `/cv` still renders the CV page.

- [ ] **Step 3: Remove CV and establish the Deep Orbit design tokens**

Delete `src/pages/cv.astro` and remove the CV item from `navigation` in `Header.astro`.

Replace the root visual tokens in `src/styles/global.css` with:

```css
:root {
  color-scheme: dark;
  --canvas: oklch(0.12 0.025 275);
  --surface: oklch(0.16 0.035 275);
  --surface-strong: oklch(0.21 0.045 275);
  --ink: oklch(0.94 0.02 275);
  --ink-muted: oklch(0.76 0.035 275);
  --border: oklch(0.35 0.055 275);
  --primary: oklch(0.72 0.15 285);
  --primary-strong: oklch(0.8 0.12 285);
  --accent: oklch(0.79 0.12 190);
  --focus: oklch(0.85 0.13 190);
  --font-sans:
    ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono:
    ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  --step--1: clamp(0.8125rem, 0.79rem + 0.12vw, 0.875rem);
  --step-0: clamp(1rem, 0.98rem + 0.1vw, 1.0625rem);
  --step-1: clamp(1.25rem, 1.2rem + 0.25vw, 1.5rem);
  --step-2: clamp(1.75rem, 1.62rem + 0.65vw, 2.25rem);
  --step-3: clamp(2.15rem, 1.95rem + 1vw, 2.9rem);
  --step-4: clamp(2.75rem, 2.42rem + 1.65vw, 4rem);
  --space-2xs: 0.375rem;
  --space-xs: clamp(0.5rem, 0.46rem + 0.2vw, 0.625rem);
  --space-s: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --space-m: clamp(1.125rem, 1rem + 0.625vw, 1.5rem);
  --space-l: clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem);
  --space-xl: clamp(2.75rem, 2.25rem + 2.5vw, 4.5rem);
  --gutter: clamp(1rem, 4vw, 3.5rem);
  --content-width: 76rem;
  --prose-width: 70ch;
  --radius-s: 0.375rem;
  --radius-m: 0.75rem;
}
```

Set the page background to controlled ambient fields:

```css
body {
  color: var(--ink);
  background:
    radial-gradient(circle at 12% 0%, oklch(0.3 0.1 285 / 0.14), transparent 32rem),
    radial-gradient(circle at 88% 20%, oklch(0.32 0.08 190 / 0.08), transparent 28rem),
    var(--canvas);
}
```

Keep headings at `letter-spacing: -0.035em`, cap panels at `var(--radius-m)`, update all former light-on-dark inversions to use `var(--ink)` on `var(--surface)`, and retain the existing focus and reduced-motion rules. Use only color, border-color, background-color, and transform transitions of 160ms or less.

Update `Footer.astro` copy to:

```astro
<span>AI for science, molecular simulation, and chemical mechanisms.</span>
```

- [ ] **Step 4: Verify shell behavior, formatting, and contrast automation**

Run:

```bash
npm run format
npm run test:e2e -- --grep "primary navigation|CV route|Axe|overflow|skip link"
npm run check
```

Expected: Prettier completes; the selected browser tests PASS with no Axe violations or 320px overflow; Astro reports no errors.

- [ ] **Step 5: Commit the shared shell redesign**

```bash
git add src/components/Header.astro src/components/Footer.astro src/styles/global.css src/pages/cv.astro tests/site.spec.ts
git commit -m "feat: apply dark portfolio shell"
```

---

### Task 3: Identity-First Homepage and Prominent Current Research

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/ProjectCard.astro`
- Modify: `src/components/PublicationList.astro`
- Test: `tests/site.spec.ts`

**Interfaces:**
- Consumes: three newest public featured projects from Task 1 and shared Deep Orbit tokens from Task 2.
- Produces: two hero tags, compact identity thesis, three readable Current Research rows, and restrained selected-project and publication lists.

- [ ] **Step 1: Write failing homepage composition tests**

Replace the homepage test's old hero assertions with:

```ts
await expect(page.getByRole("heading", { level: 1, name: "Ryan Yu" })).toHaveCount(1);
await expect(page.getByText("AI for science", { exact: true })).toBeVisible();
await expect(page.getByText("Molecular simulation", { exact: true })).toBeVisible();
await expect(
  page.getByText(
    "Interpretable protein representations, machine-learned potentials, and molecular mechanisms.",
    { exact: true },
  ),
).toBeVisible();

const currentResearch = page.getByRole("region", {
  name: "Current Research",
});
const researchRows = currentResearch.getByRole("article");
await expect(researchRows).toHaveCount(3);
for (const [index, lab] of [
  "Rotskoff Lab",
  "Fong Lab",
  "Goddard Lab",
].entries()) {
  await expect(researchRows.nth(index)).toContainText(lab);
}
await expect(researchRows.nth(0)).toContainText("BioEmu and ESM3");
await expect(researchRows.nth(1)).toContainText("LAMMPS and CP2K");
await expect(researchRows.nth(2)).toContainText("GROMACS and PLUMED");
await expect(
  page.getByRole("link", { name: "Ryan Yu on LinkedIn" }),
).toHaveAttribute(
  "href",
  "https://www.linkedin.com/in/ryan-yu-0bb27a23b",
);
```

Add a readability guard:

```ts
const researchCopySize = await researchRows
  .first()
  .locator("p")
  .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
expect(researchCopySize).toBeGreaterThanOrEqual(16);
```

- [ ] **Step 2: Run the homepage test and verify failure**

Run:

```bash
npm run test:e2e -- --grep "homepage presents"
```

Expected: FAIL because the tags and Current Research region do not exist.

- [ ] **Step 3: Implement the compact homepage composition**

In `src/pages/index.astro`, map the project IDs to public lab labels:

```ts
const currentResearch = [
  {
    id: "rotskoff-protein-representations",
    lab: "Rotskoff Lab",
    institution: "Stanford University · June 2026–present",
  },
  {
    id: "nitrate-reduction-electrolytes",
    lab: "Fong Lab",
    institution: "Caltech · December 2024–present",
  },
  {
    id: "smoothened-gi",
    lab: "Goddard Lab",
    institution: "Caltech · December 2023–present",
  },
].flatMap((record) => {
  const project = featuredProjects.find((entry) => entry.id === record.id);
  return project ? [{ ...record, project }] : [];
});
```

Use this hero:

```astro
<section class="home-hero">
  <div class="container home-hero__inner">
    <ul class="hero-tags" aria-label="Research areas">
      <li>AI for science</li>
      <li>Molecular simulation</li>
    </ul>
    <h1>{profile.name}</h1>
    <p class="hero-thesis">
      Interpretable protein representations, machine-learned potentials, and
      molecular mechanisms.
    </p>
    <a class="button button--secondary" href={toRoute("/research")}>
      Explore current research
    </a>
  </div>
</section>
```

Insert directly after the hero:

```astro
<section
  class="current-research"
  aria-labelledby="current-research-title"
>
  <div class="container">
    <div class="section-heading section-heading--split">
      <h2 id="current-research-title">Current Research</h2>
      <p>Three complementary routes from representation and simulation to mechanism.</p>
    </div>
    <div class="research-row-list">
      {currentResearch.map(({ project, lab, institution }) => (
        <article class="research-row">
          <div>
            <h3>{lab}</h3>
            <p class="research-row__meta">{institution}</p>
          </div>
          <p>{project.data.summary}</p>
          <a href={toRoute(`/research#${project.id}`)}>
            View research<span class="sr-only"> in the {lab}</span>
          </a>
        </article>
      ))}
    </div>
  </div>
</section>
```

Style the hero without a viewport-height minimum, keep it below roughly 34rem on desktop, render tags as compact periwinkle/cyan pills, and define each `.research-row` as a three-column ruled row that collapses to one column below 48rem. Set `.research-row > p` to `font-size: var(--step-0)` and never use meta sizing for the main description.

Retain Research interests, Selected projects, Research outputs, and Contact in that order, reducing each section to `padding-block: var(--space-xl)` and keeping ruled lists visually distinct from cards.

In `ProjectCard.astro` and `PublicationList.astro`, use the shared surface and border tokens, avoid shadows, keep radii at `var(--radius-m)`, and use `var(--step--1)` only for dates, status, venue, and theme metadata.

- [ ] **Step 4: Verify homepage behavior and accessibility**

Run:

```bash
npm run format
npm run test:e2e -- --grep "homepage presents|Axe|heading levels|overflow"
```

Expected: PASS; the three research rows appear Rotskoff, Fong, Goddard; their descriptions compute to at least 16px; no Axe, heading, or 320px overflow regression appears.

- [ ] **Step 5: Commit the homepage redesign**

```bash
git add src/pages/index.astro src/components/ProjectCard.astro src/components/PublicationList.astro tests/site.spec.ts
git commit -m "feat: foreground current research"
```

---

### Task 4: Research, Projects, Papers, and About Pages

**Files:**
- Modify: `src/pages/research.astro`
- Modify: `src/pages/projects/index.astro`
- Modify: `src/pages/projects/[id].astro`
- Modify: `src/pages/papers.astro`
- Modify: `src/pages/about.astro`
- Test: `tests/site.spec.ts`

**Interfaces:**
- Consumes: three project collection entries and the PNAS journal record from Task 1; tokens and shared components from Tasks 2–3.
- Produces: Rotskoff-first research presentation, all three project routes, published paper output, and current appointment trajectory.

- [ ] **Step 1: Write failing route-level tests**

Update the research test with:

```ts
for (const [index, heading] of [
  "Interpretable protein representations",
  "Machine-learned potentials for nitrate-reduction electrolytes",
  "Smoothened/Gi activation mechanism",
].entries()) {
  await expect(
    page.locator(".research-track h2").nth(index),
  ).toHaveText(heading);
}
await expect(page.getByText("BioEmu and ESM3", { exact: false })).toBeVisible();
await expect(page.getByText("LAMMPS and CP2K", { exact: false })).toBeVisible();
await expect(page.getByText("GROMACS and PLUMED", { exact: false })).toBeVisible();
```

Update the project-route matrix to:

```ts
for (const [path, datetime, label] of [
  ["/projects/rotskoff-protein-representations", "2026-06", "June 2026"],
  ["/projects/nitrate-reduction-electrolytes", "2024-12", "December 2024"],
  ["/projects/smoothened-gi", "2023-12", "December 2023"],
]) {
  await page.goto(path);
  await expect(page.locator(`time[datetime='${datetime}']`)).toHaveText(label);
}
```

Update the papers assertions to:

```ts
await expect(page.getByRole("heading", { level: 2, name: "2026" })).toBeVisible();
await expect(page.getByText("Published", { exact: true })).toBeVisible();
await expect(
  page.getByText(
    "Ryan D. Yu, Amy-Doan P. Vo, Soo-Kyung Kim, William A. Goddard III",
    { exact: true },
  ),
).toBeVisible();
await expect(
  page.getByRole("link", { name: /DOI/i }),
).toHaveAttribute("href", "https://doi.org/10.1073/pnas.2604658123");
await expect(page.locator("time[datetime='2026']")).toHaveText("2026");
await expect(page.locator("[data-publication-type]")).toHaveAttribute(
  "data-publication-type",
  "journal",
);
```

Update the About assertions:

```ts
for (const appointment of ["Rotskoff Lab", "Fong Lab", "Goddard Lab"]) {
  await expect(
    page.getByRole("main").getByText(appointment, { exact: true }),
  ).toBeVisible();
}
await expect(page.getByText("June 2026–present", { exact: true })).toBeVisible();
```

- [ ] **Step 2: Run the focused route tests and verify failure**

Run:

```bash
npm run test:e2e -- --grep "research page|project route|papers page|about page"
```

Expected: FAIL because Rotskoff is absent from Research and About and old year/status/author expectations remain in the rendered pages.

- [ ] **Step 3: Render all current research and update page copy**

In `src/pages/research.astro`, replace ID-specific variables with an ordered record configuration:

```ts
const orderedTracks = [
  "rotskoff-protein-representations",
  "nitrate-reduction-electrolytes",
  "smoothened-gi",
].flatMap((id) => {
  const project = projects.find((entry) => entry.id === id);
  return project ? [project] : [];
});
const renderedTracks = await Promise.all(
  orderedTracks.map(async (project) => ({
    project,
    Content: (await render(project)).Content,
  })),
);
```

Render the records with one reusable loop:

```astro
<div class="research-tracks">
  {renderedTracks.map(({ project, Content }, index) => (
    <section
      class:list={["research-track", { "research-track--alternate": index % 2 === 1 }]}
      id={project.id}
      aria-labelledby={`${project.id}-title`}
    >
      <div class="container research-track__grid">
        <div class="track-heading">
          <p>{project.data.status}</p>
          <h2 id={`${project.id}-title`}>{project.data.title}</h2>
        </div>
        <div class="track-copy">
          <p>{project.data.summary}</p>
          <Content />
          <ul aria-label={`${project.data.title} research themes`}>
            {project.data.themes.map((theme) => <li>{theme}</li>)}
          </ul>
        </div>
      </div>
    </section>
  ))}
</div>
```

Set the research lede to:

```astro
<p class="research-lede">
  I study interpretable protein representations, electrochemical interfaces,
  and biomolecular mechanisms with machine learning and molecular simulation.
</p>
```

Keep `ResearchFlow`, reduce its section spacing to the shared compact scale, and preserve the validation note.

Update the Projects index description to:

```astro
description="Research project records spanning interpretable protein representations, molecular simulation, and electrochemical interfaces."
```

Keep the existing project-detail document sections in `[id].astro`, but use the compact heading scale and surface tokens and allow month-precision dates to render through the existing date helper.

Update Papers lede to `Published research outputs, organized by year.` and keep the existing conditional filter dormant for one publication.

Replace About's methods paragraph with:

```astro
<p>
  Ryan’s work combines interpretable learned representations, first-principles
  calculations, machine-learned interatomic potentials, molecular dynamics, and
  metadynamics. Current questions span protein conformational distributions,
  electrochemical nitrate-reduction interfaces, and GPCR activation mechanisms.
</p>
```

Render appointments in current-relevance order:

```astro
<dl>
  <div><dt>Rotskoff Lab · Stanford University</dt><dd>June 2026–present</dd></div>
  <div><dt>Fong Lab · Caltech</dt><dd>December 2024–present</dd></div>
  <div><dt>Goddard Lab · Caltech</dt><dd>December 2023–present</dd></div>
</dl>
```

Apply the compact shared spacing and dark surface treatments to each page without adding animation, images, or cards where ruled rows already communicate hierarchy.

- [ ] **Step 4: Run all browser tests**

Run:

```bash
npm run format
npm run test:e2e
```

Expected: all Playwright tests PASS in configured desktop Chromium and Pixel 7 projects, including the three project routes, published paper, About trajectory, Axe, headings, reduced motion, and 320px overflow checks.

- [ ] **Step 5: Commit the remaining page redesign**

```bash
git add src/pages/research.astro src/pages/projects src/pages/papers.astro src/pages/about.astro tests/site.spec.ts
git commit -m "feat: redesign research portfolio pages"
```

---

### Task 5: Release Verification and Privacy Audit

**Files:**
- Modify only if a verification failure exposes a requirement gap; keep fixes scoped to the failing file and add a regression assertion to the matching test.

**Interfaces:**
- Consumes: the completed site from Tasks 1–4.
- Produces: evidence that formatting, Astro types, unit/browser tests, static output, Worker configuration, canonical URLs, asset paths, and privacy constraints are release-ready.

- [ ] **Step 1: Scan tracked/public sources for excluded material**

Run:

```bash
rg -n -i "curriculum vitae|resume|\\.pdf|phone|tel:|toy simulation|sparse-autoencoder node|gpcr animation|canvas|webgl|<video|<img" src public tests
git check-ignore -v Yu_Ryan_Resume.pdf
git ls-files -- Yu_Ryan_Resume.pdf public
```

Expected: no CV/resume link, phone, scientific interactive, video, or unpublished figure is present; `Yu_Ryan_Resume.pdf` is ignored by the repository-root rule and absent from tracked/public files. Existing benign `<img>` support code may appear only in generic figure components/tests.

- [ ] **Step 2: Run the complete local verification suite**

Run:

```bash
npm run format:check
npm run check
npm run test:unit
npm run test:e2e
npm run build
npx wrangler deploy --dry-run
```

Expected: every command exits 0; Vitest and both Playwright projects pass; Astro builds static pages; Wrangler reports a valid Workers Static Assets dry run without deploying.

- [ ] **Step 3: Inspect generated routes, canonicals, and asset paths**

Run:

```bash
test ! -e dist/cv/index.html
test -e dist/projects/rotskoff-protein-representations/index.html
rg -n 'https://site\\.rdyu-cm\\.workers\\.dev/(research|projects|papers|about)?' dist
rg -n '(href|src)="/_astro/' dist
rg -n -i 'Yu_Ryan_Resume|tel:|\\.pdf' dist
```

Expected: `/cv` has no generated page; the Rotskoff project exists; canonical URLs use `https://site.rdyu-cm.workers.dev`; built assets are root-relative; no resume, telephone link, or PDF appears in `dist`.

- [ ] **Step 4: Review the final diff and commit any verification-only test fix**

Run:

```bash
git status --short
git diff --check
git log --oneline --decorate -5
```

Expected: no uncommitted implementation changes, no whitespace errors, and
separate commits for public content, shared shell, homepage, and remaining
pages. A verification failure returns execution to the task that owns the
failing file; add the regression there, rerun that task's checks, and repeat
Tasks 5.1–5.4 before handoff.

- [ ] **Step 5: Request review before merging**

Provide the branch name `design/dark-research-redesign`, the verification command results, and a concise visual/content summary. Do not merge into `main`, push, or deploy until Ryan explicitly approves the verified branch.
