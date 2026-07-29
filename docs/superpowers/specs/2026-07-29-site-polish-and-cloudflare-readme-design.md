# Site Polish and Cloudflare README Design

Date: 2026-07-29  
Status: Approved design, pending implementation plan

## Objective

Polish the public repository and shared-site metadata without changing the
research-site information architecture or adding runtime behavior.

## Included changes

### Public repository cleanup

- Remove the tracked `.superpowers/sdd/task-4-report.md`.
- Remove the tracked `docs/superpowers/plans/` and
  `docs/superpowers/specs/` trees after this design has been translated into an
  implementation plan.
- Keep source code, public content, tests, and deployment configuration intact.
- Do not rewrite Git history. The cleanup applies to the current repository
  tree only.

### Deep Orbit browser identity

- Change the browser `theme-color` to the near-black Deep Orbit canvas:
  `#11121c`.
- Update `public/favicon.svg` to use the Deep Orbit canvas, periwinkle, cyan,
  and soft-lavender colors.
- Preserve the existing molecular-node mark, 32×32 view box, accessible name,
  and SVG format.

### Social sharing preview

- Add a deterministic 1200×630 PNG at `public/social-preview.png`.
- The preview uses the site’s Deep Orbit palette, system typography, restrained
  molecular-node motif, and this exact public copy:
  - `Ryan Yu`
  - `AI for science · Molecular simulation`
  - `Interpretable protein representations, machine-learned potentials, and molecular mechanisms.`
- Do not use scientific data, trajectories, protein structures, lab logos,
  external imagery, or generated scientific claims.
- Use the preview as the default Open Graph and Twitter large-card image on
  every page unless a page explicitly supplies another image.
- Emit absolute canonical image URLs and meaningful image dimensions and alt
  metadata.
- Add no runtime dependency. Generate the checked-in PNG with existing local
  browser/rendering capabilities or another deterministic local method.

### README rewrite

Rewrite `README.md` as current operational documentation for:

- Astro static output deployed through Cloudflare Workers Static Assets.
- Worker name `rdyu-site` and canonical URL
  `https://site.rdyu-cm.workers.dev`.
- Automatic deployment after pushes to `main`.
- Cloudflare build command `npm run build`.
- Cloudflare deploy command `npx wrangler@latest deploy`.
- Node.js 22.12 or newer and root directory `/`.
- Optional `SITE_URL` override for a future custom domain.
- Local setup, content authoring, privacy constraints, and complete release
  verification.

Remove obsolete statements that:

- Describe GitHub Pages as the hosting target.
- Describe `/cv` as a live page.
- Instruct maintainers to edit `src/pages/cv.astro`.

The README must continue to state that the root résumé PDF is ignored and must
not be published, and that no phone number or private/unpublished research
material belongs in public assets.

### Local-only future roadmap

Create a local-only note at `.notes/future-site-improvements.md` containing:

- Connect a custom domain and update `SITE_URL`.
- Add ORCID and Google Scholar when profiles are ready.
- Add one explicitly public, scientifically meaningful figure per project.
- Add BibTeX/citation download support.
- Add a build-derived “Last updated” indicator only if it remains accurate and
  useful.
- Revisit the deferred scientific interactives separately.

Exclude `.notes/` through `.git/info/exclude`, not `.gitignore`, so the roadmap
is not published or committed.

## Technical design

- `src/components/Seo.astro` resolves `/social-preview.png` through the existing
  `resolveSocialImage()` helper whenever `image` is omitted.
- `src/layouts/BaseLayout.astro` updates only the browser theme color.
- `public/favicon.svg` remains a small deterministic vector.
- `public/social-preview.png` is a checked-in static asset with exact dimensions
  1200×630.
- Existing page props remain backward-compatible: a page-specific `image`
  continues to override the default preview.
- Tests validate default and explicit social-image behavior, absolute image
  URLs, dimensions, alt copy, the favicon/theme color, README deployment copy,
  and privacy exclusions.

## Verification

Before merge:

1. Run Prettier check.
2. Run Astro diagnostics.
3. Run unit tests.
4. Run Playwright tests.
5. Run the production build.
6. Run Wrangler deployment with `--dry-run`.
7. Inspect the built HTML for absolute Open Graph/Twitter image URLs.
8. Confirm `social-preview.png` is exactly 1200×630.
9. Confirm the current tree contains no `.superpowers/` or
   `docs/superpowers/` paths.
10. Confirm the résumé PDF remains ignored and absent from tracked files and
    build output.

## Non-goals

- No custom-domain or DNS changes.
- No ORCID or Google Scholar links until Ryan supplies confirmed profiles.
- No research figures without an explicitly public source.
- No BibTeX endpoint or build timestamp in this pass.
- No new scientific interactive.
- No dependency upgrade or audit remediation.
- No push, deployment, or merge without explicit approval.

