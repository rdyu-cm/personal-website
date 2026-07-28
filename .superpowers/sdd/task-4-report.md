# Task 4 Report: Homepage and Research Narrative

## Revisions

- Base: `295e3e5aa3a75f98e60d760351706a4b767343cc`
- Head: Task 4 commit (`feat: add research narrative and homepage`)
- Branch: `feature/personal-research-website`

## Files

- `src/components/ProjectCard.astro`
- `src/components/PublicationList.astro`
- `src/components/ResearchFlow.astro`
- `src/pages/index.astro`
- `src/pages/research.astro`
- `tests/site.spec.ts`
- `.superpowers/sdd/task-4-report.md`

## Verification

- TDD red: `npm run test:e2e -- tests/site.spec.ts --project=chromium` — expected 2 failures for the missing homepage research overview and missing `/research` ordered workflow; 3 existing tests passed.
- TDD green/focused browser: `npm run test:e2e -- tests/site.spec.ts` — 10/10 passed across `chromium` and `pixel-7`.
- Format: `npm run format:check` — passed.
- Astro: `npm run check` — 21 files checked, 0 errors, 0 warnings, 0 hints.
- Unit: `npm run test:unit` — 3 files passed, 13/13 tests passed.
- Default build: `npm run build` — 2 pages generated; generated HTML uses `/personal-website` asset and internal-link prefixes and GitHub Pages canonicals.
- Root-domain build: `SITE_URL=https://research.example.com npm run build` — 2 pages generated; generated HTML uses root-relative assets/internal links and root-domain canonicals.
- 320px review: temporary Playwright checks for `/` and `/research` both passed. At a 320px viewport, root and body scroll widths were exactly 320px and both h1 boxes measured 213.5px wide. Full-page screenshots were captured in `/tmp`; the image-view helper could not open them because of the session-wide bwrap loopback failure.
- Diff hygiene: `git diff --check` passed; source grep found no draft marker.

## Content decisions

- The homepage states Ryan Yu's verified Caltech undergraduate role and connects AI/ML potentials, molecular simulation, electrochemical interfaces, and biomolecular mechanisms.
- The workflow is ordered as First-principles data → Learned potentials → Molecular simulation → Physical insight and is grounded in the existing DFT/MACE/nitrate-electrolyte record.
- Selected projects and outputs come only from `takeFeatured`, which excludes drafts before limiting results.
- The Smoothened manuscript is presented only as `Submitted`; no venue or unavailable link is rendered.
- Project and publication dates use `datePrecision`; current year-only entries display only their year.
- Output and contact sections are conditional on public data being present.

## Design decisions

- Continued the Task 3 cobalt/teal scientific-instrument system with ruled sections, precise connectors, restrained surfaces, and the existing typographic scale.
- Used project cards only for scannable project summaries. Research themes, publications, workflow, and detailed tracks use distinct semantic structures to vary page rhythm.
- Built `ResearchFlow` as an ordered list with CSS connectors and a vertical 320px treatment; no canvas or client JavaScript was added.
- Avoided decorative gradients, glass, grid backgrounds, repeated eyebrow labels, and invented imagery.

## Self-review

- One h1 per page; headings remain within the viewport at 320px.
- No horizontal overflow at 320px on either page.
- Internal homepage and project-context links use `BASE_URL`; generated default/root-domain HTML was inspected in both configurations.
- Publication author order is unchanged, titles use `cite`, absent links/venue are omitted, and public contact links are the profile's existing Email and GitHub records.
