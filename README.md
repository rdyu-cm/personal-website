# Ryan Yu research website

Static Astro site for Ryan Yu's research profile. The current public canonical
URL is `https://rdyu-cm.github.io/personal-website`.

## Setup and scripts

Use Node.js 22.12 or newer and npm. Install the exact locked dependency graph:

```bash
npm ci
```

Use these commands during development and before release:

```bash
npm run dev
npm run format
npm run format:check
npm run check
npm run test:unit
CI=1 npm run test:e2e
npm run build
npm run preview -- --host 127.0.0.1
```

`npm run build` runs Astro type/content validation before generating `dist/`.
The Playwright command exercises both configured desktop and mobile projects;
setting `CI=1` makes it start a fresh local server.

## Content authoring

Projects are Markdown files in `src/content/projects/`; publications are in
`src/content/publications/`. Their required frontmatter is typed in
`src/content.config.ts`. Copy an existing entry and supply every required
field, including a `date` plus its matching `datePrecision` (`year`, `month`,
or `day`), `themes`, `featured`, and `draft`.

Set `draft: true` to keep an entry out of all public lists and routes. Change
it to `false` only when it is ready to publish. Publication `type` must be one
of `journal`, `conference`, `preprint`, or `manuscript`; optional links are
validated URLs. A project that has `heroImage` must also provide meaningful
`heroAlt` text.

Only add images that are intended to be public. Put a public static image under
`public/` and reference it with a base-safe path (for example,
`/images/example.png`); provide accurate alt text and dimensions whenever it is
rendered with `Figure`. Do not put private source images, unpublished figures,
or personal documents in `public/`, `src/content/`, or any referenced asset
path: everything copied to `dist/` is publicly deployable.

The site deliberately serves an HTML CV, not a downloadable resume. Keep
`Yu_Ryan_Resume.pdf` only at repository root: it is ignored by Git and must
remain untracked. Never move, link, or copy it into `public/` or `dist/`.
Do not add a phone number to the CV or other public content.

## Canonical URL and deployment base

`SITE_URL` controls Astro's `site` and derived deployment `base`. With the
default `https://rdyu-cm.github.io/personal-website`, generated routes use the
`/personal-website` base and canonical URLs, sitemap, robots sitemap URL, and
homepage Person JSON-LD use that public URL.

For a future root-domain deployment, set `SITE_URL` to the final HTTPS origin
without a path, for example:

```bash
SITE_URL=https://research.example.com npm run build
```

This produces no Astro base path. Use the identical value in Cloudflare Pages
and CI when the custom domain is chosen; do not change DNS as part of this
repository workflow. The default and CI value should remain the GitHub Pages
URL until that decision is made.

## Cloudflare Pages handoff

When Cloudflare access is available, create a Pages project from Git repository
`rdyu-cm/personal-website` with:

| Setting                | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Production branch      | `main`                                         |
| Build command          | `npm run build`                                |
| Build output directory | `dist`                                         |
| Node.js version        | 22.12 or newer                                 |
| Environment variable   | `SITE_URL` = the eventual public canonical URL |
| Preview behavior       | Enable preview builds for feature branches/PRs |

Do not connect a custom domain or alter DNS during this setup. Cloudflare
credentials and the GitHub integration are external prerequisites; this
repository does not contain them.

## Release verification

Run a clean install and the complete release suite:

```bash
npm ci
npm run format:check
npm run check
npm run test:unit
CI=1 npm run test:e2e
npm run build
SITE_URL=https://research.example.com npm run build
```

Inspect both builds for `sitemap-index.xml`, `robots.txt`, `404.html`, correct
canonical URLs and JSON-LD, and ensure no resume PDF or phone number appears in
`dist/`. Check rendered local and external links in a preview. This project has
no locally installed Lighthouse runner; use Lighthouse manually against Home,
Research, one public project, and Papers when the deployment preview is
available.
