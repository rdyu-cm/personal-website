# Ryan Yu research website

Static Astro research portfolio deployed as Cloudflare Workers Static Assets.
The canonical public URL is `https://site.rdyu-cm.workers.dev`.

## Local development

Use Node.js 22.12 or newer and npm. Install the exact locked dependency graph:

```bash
npm ci
```

Common commands:

```bash
npm run dev
npm run social-preview
npm run format
npm run format:check
npm run check
npm run test:unit
CI=1 npm run test:e2e
npm run build
npm run preview -- --host 127.0.0.1
```

`npm run social-preview` deterministically regenerates
`public/social-preview.png` through the existing Playwright toolchain.
`npm run build` validates Astro types and content before producing the static
`dist/` directory.

## Updating public content

Shared identity and contact links live in `src/data/profile.ts`. Projects are
Markdown files in `src/content/projects/`; publications are in
`src/content/publications/`. Their frontmatter is typed in
`src/content.config.ts`.

Copy an existing record and provide every required field, including `date`,
`datePrecision` (`year`, `month`, or `day`), `themes`, `featured`, and `draft`.
Set `draft: true` until an entry is ready to appear in public lists and routes.
Publication `type` must be `journal`, `conference`, `preprint`, or `manuscript`.

Public static assets belong in `public/`. A project using `heroImage` must also
provide meaningful `heroAlt` text. Run the complete verification suite before
publishing new copy, links, or images.

## Privacy and publication boundary

Everything copied to `dist/` and every tracked repository file should be
treated as public.

Do not add private source images, unpublished figures, research data, model
outputs, trajectories, personal documents, credentials, a phone number, or
other sensitive information to `public/`, `src/`, documentation, tests, or
referenced asset paths.

`Yu_Ryan_Resume.pdf` may remain only at the repository root. It is ignored by
Git and must stay untracked; never move, link, or copy it into `public/` or
`dist/`. The public site intentionally has no CV route or résumé download.

## Cloudflare deployment

Worker `rdyu-site` is connected to `rdyu-cm/personal-website`. Pushes to `main`
automatically build and deploy through Cloudflare Workers Builds.

| Setting                       | Value                                                |
| ----------------------------- | ---------------------------------------------------- |
| Production branch             | `main`                                               |
| Build command                 | `npm run build`                                      |
| Deploy command                | `npx wrangler@latest deploy`                         |
| Non-production deploy command | `npx wrangler@latest versions upload`                |
| Root directory                | `/`                                                  |
| Node.js version               | 22.12 or newer                                       |
| Environment variable          | `SITE_URL=https://site.rdyu-cm.workers.dev`          |
| Preview behavior              | Preview builds for feature branches or pull requests |

`wrangler.jsonc` serves the generated `dist` directory through Workers Static
Assets. The project uses static Astro output: it has no Worker entry point,
Astro server adapter, or runtime compute.

Cloudflare credentials, GitHub access, domains, and DNS remain external to this
repository. Do not commit credentials or tokens.

## Custom-domain handoff

`SITE_URL` controls Astro’s canonical `site` and deployment base. For a future
root-domain deployment, use the final HTTPS origin without a path:

```bash
SITE_URL=https://research.example.com npm run build
```

Set the identical value in Cloudflare Workers Builds when connecting the custom
domain. DNS and domain configuration are intentionally outside this repository.

## Release verification

Run:

```bash
npm ci
npm run format:check
npm run check
npm run test:unit
CI=1 npm run test:e2e
npm run build
npx wrangler deploy --dry-run
```

Inspect the production output for:

- `sitemap-index.xml`, `robots.txt`, and `404.html`.
- Correct canonical URLs and structured data.
- Absolute Open Graph and Twitter image URLs.
- Root-relative static assets.
- No `/cv` page, résumé PDF, phone number, credentials, or private material.

After an approved push to `main`, smoke-test Home, Research, one project,
Papers, and the branded not-found page on the live Worker URL.
