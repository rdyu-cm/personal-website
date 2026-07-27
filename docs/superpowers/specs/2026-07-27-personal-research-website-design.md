# Personal AI-for-Science Research Website

## Purpose

Create a public personal website for a researcher working at the intersection of
machine learning, molecular simulation, electrochemistry, and scientific
software.

The site must serve two audiences without splitting into separate experiences:

- Academic readers should quickly understand the scientific questions,
  methods, contributions, and publication record.
- AI-for-science industry readers should also see evidence of engineering
  judgment, reproducibility, software quality, and the ability to turn research
  ideas into usable systems.

The initial positioning statement is:

> I build reliable computational tools and machine-learning models for
> molecular simulation, electrochemical interfaces, and scientific discovery.

This copy is provisional. It must be replaced or approved once the site owner
provides their preferred role, affiliation, biography, and terminology.

## Product Principles

1. Lead with a coherent research identity, not a list of technologies.
2. Present projects as scientific case studies with engineering evidence.
3. Use real research artifacts rather than decorative AI imagery.
4. Keep all factual claims traceable to supplied profile information or source
   material.
5. Make incomplete publication history honest: preprints, posters, reports, and
   manuscripts must not be presented as peer-reviewed papers.
6. Keep the first version static, portable, fast, accessible, and easy to
   maintain in Git.

## Scope

### Version-one pages

- Home
- Research
- Projects
- Individual project pages
- Papers
- About
- CV
- Contact information integrated into the site footer and relevant pages
- Custom not-found page

### Version-one capabilities

- Responsive navigation
- Typed content for projects and papers
- Publication filtering by year, topic, and type when enough entries exist to
  make filtering useful
- Links to available DOI, arXiv, code, slides, project pages, and BibTeX
- Downloadable CV PDF
- Search-engine and social-sharing metadata
- Sitemap
- Privacy-respecting, cookieless traffic analytics
- Accessible keyboard, focus, contrast, and reduced-motion behavior

### Explicitly deferred

- Blog or news feed
- Content-management system
- Database
- Authentication
- Contact form or server-side email delivery
- Automatic scraping of Google Scholar
- Dark mode
- Complex WebGL molecular visualization
- Live GitHub activity or citation counters

Deferred features may be reconsidered after launch based on actual content and
maintenance needs.

## Information Architecture

### Home

The homepage should answer four questions in order:

1. Who is this researcher?
2. What scientific problems do they work on?
3. What have they built or contributed?
4. How can a visitor learn more or make contact?

Sections:

- Compact site header with name and primary navigation
- Hero containing name, role, affiliation, research thesis, and actions for
  "Explore research" and "View CV"
- Three research themes:
  - Machine-learned interatomic potentials
  - Atomistic simulation and molecular dynamics
  - Electrochemical interfaces and reproducible scientific workflows
- Two or three selected project case studies
- Selected publications or, when formal publications are unavailable, a
  clearly labeled selected-output section
- Brief current-status and contact section
- Footer with profile links and site metadata

### Research

Explain the research program as a connected workflow rather than independent
keywords:

`first-principles data → learned potentials → molecular simulation → physical insight`

The page should explain the scientific motivation, current interests, and the
relationship among data generation, modeling, simulation, validation, and
interpretation. A restrained diagram may communicate this workflow if it can be
made accurate from supplied material.

### Projects

The project index provides scannable cards. Each project page follows a common
case-study structure:

1. Scientific question
2. Context and constraints
3. Approach and the site owner's contribution
4. Validation and results
5. Engineering or reproducibility decisions
6. Figures or artifacts
7. Related code, paper, poster, or report

The existing nitrate-electrochemistry simulation tooling is the leading
candidate for the first featured project. Its exact title, collaborators,
status, and publishable details must be confirmed before publication.

### Papers

The papers page is a bibliography rather than a collection of marketing cards.
Entries display:

- Title
- Authors
- Venue or output type
- Year and status
- Short optional contribution summary
- Links to DOI, arXiv, code, slides, project, and BibTeX when available

Filters should appear only when the bibliography is large enough that they
reduce effort. With a small list, grouping by year is clearer.

### About and CV

The About page contains a short biography, research trajectory, education or
experience timeline, and a concise list of relevant methods and tools. It
should not duplicate the full CV.

The CV page provides an accessible HTML summary and a link to the authoritative
PDF. The PDF is a supplied asset; the site will not generate or modify it
unless separately requested.

## Content Model

Site-wide profile data should include:

- Name
- Preferred role or headline
- Affiliation
- Location, if public
- Short and long biography
- Email or preferred contact method
- Profile URLs for GitHub, Google Scholar, ORCID, and LinkedIn as applicable
- CV file path
- Availability or current-status statement, when desired

Project entries should include:

- Slug
- Title
- Short summary
- Status
- Dates
- Research themes
- Role and collaborators
- Scientific question
- Methods
- Results or evidence
- Reproducibility notes
- Hero and supporting figures with captions and alternative text
- External links
- Featured flag and display order

Publication entries should include:

- Stable identifier
- Title
- Authors in publication order
- Year
- Venue
- Type
- Status
- Research themes
- Optional summary
- DOI, arXiv, code, slides, project, and BibTeX links
- Featured flag

Content should live in typed Markdown or MDX collections. Structured data
should be separated from presentation so that entries can be updated without
editing layout components.

## Visual Design

The visual character is editorial, scientific, and restrained rather than
corporate or futuristic.

- Warm off-white or pale neutral background
- Near-black body text
- One restrained cobalt, teal, or spectral-blue accent
- High-contrast accessible secondary colors for links and status labels
- An editorial display face paired with a highly legible sans-serif or a
  carefully selected single variable font
- Generous whitespace and a narrow readable measure for prose
- Consistent figure captions and citation-like metadata
- Fine rules, compact tags, and subtle grid structure
- Actual plots, structures, trajectories, or workflow diagrams as visual
  anchors

Avoid:

- Stock neural-network or glowing-brain imagery
- Excessive gradients, glass effects, and animated backgrounds
- Vanity counters without a stable, verifiable source
- Dense skill-cloud sections
- Repeated calls to action
- Long horizontal timelines on small screens

Motion should be limited to purposeful transitions and subtle figure reveals.
All motion must respect `prefers-reduced-motion`.

## Technical Architecture

Use Astro with TypeScript and static output.

Primary units:

- Shared application shell for metadata, header, footer, and navigation
- Small reusable typography and layout primitives
- Content collections for projects and publications
- Project-card and publication-entry components
- Page-specific composition for Home, Research, Projects, Papers, About, and CV
- Optional isolated interactive component for publication filters
- Build-time generation of metadata, sitemap, and structured data

No client-side framework should be shipped for static content. Interactive
JavaScript should be introduced only for controls that cannot be expressed
well with HTML and CSS.

The deployment artifact must remain ordinary static files so the site can move
among Cloudflare Pages, GitHub Pages, and Vercel without changing the content
model.

## Data Flow

1. The site owner edits profile data or Markdown/MDX entries.
2. Astro validates the content schema during the build.
3. Static routes and metadata are generated from validated content.
4. The hosting provider publishes the generated static directory.
5. Visitors receive HTML and static assets from the provider's edge network.

Missing required content should fail the build with a useful validation error.
Optional external links should be omitted rather than rendered as disabled
controls.

## Hosting

Use Cloudflare Pages for the initial production deployment, backed by a GitHub
repository and a custom domain.

Reasons:

- Static asset requests are free and unlimited on Cloudflare Pages.
- The free plan comfortably exceeds the expected size and deployment frequency.
- Git-backed builds and preview deployments are supported.
- Static output avoids dependence on Cloudflare-specific runtime APIs.

Constraints:

- A custom apex domain requires the domain to use Cloudflare nameservers.
- Individual static assets must remain below the provider's current 25 MiB
  limit.
- Server functions are out of scope and would use Workers quotas if introduced.

GitHub Pages is the fallback for maximum operational simplicity. Vercel remains
a viable alternative if its pull-request preview experience becomes more
important or a future version requires a framework-specific runtime.

The custom domain is a launch requirement, but domain registration itself is a
user-owned external action.

## Accessibility and Quality

The implementation must:

- Use semantic landmarks and a logical heading hierarchy
- Be fully usable with a keyboard
- Provide visible focus states
- Meet WCAG AA contrast targets
- Give meaningful figures descriptive alternative text
- Treat decorative images as decorative
- Preserve content and navigation at 200% zoom
- Support narrow mobile screens without horizontal overflow
- Respect reduced-motion preferences
- Avoid layout shifts caused by images or font loading

Performance goals for the production build:

- Lighthouse Performance, Accessibility, Best Practices, and SEO scores of at
  least 95 on representative pages
- No avoidable client-side JavaScript on static pages
- Responsive images with explicit dimensions
- Locally hosted or carefully loaded fonts

## Metadata and Discovery

Each public page should include:

- Unique title and description
- Canonical URL
- Open Graph and social-card metadata
- Appropriate index/follow directives

The site should provide:

- XML sitemap
- `robots.txt`
- `Person` structured data
- `ScholarlyArticle` structured data for publication entries where accurate
- Stable, readable URLs

Publication metadata must not claim a venue, review status, DOI, or authorship
that has not been supplied and verified.

## Error Handling

- Content-schema failures stop the build and identify the invalid entry.
- Broken local asset references stop the build where tooling permits.
- Missing optional links do not produce empty buttons.
- Unknown routes show a branded 404 page with navigation back to core content.
- External-link checks run during verification but do not silently rewrite
  destinations.
- Analytics failure must never affect page rendering.

## Verification Strategy

Before launch:

1. Run formatter, type checker, and production build.
2. Run focused component or content-schema tests where logic exists.
3. Validate every generated route and local link.
4. Check external links and report transient failures separately.
5. Run automated accessibility checks on representative pages.
6. Perform keyboard and responsive smoke tests in a real browser.
7. Run Lighthouse against the production-like static build.
8. Confirm sitemap, robots directives, canonical URLs, structured data, social
   cards, and 404 behavior.
9. Verify a Cloudflare preview deployment before connecting the custom domain.

## Content Required From the Site Owner

Implementation can begin with placeholders clearly marked as unpublished, but
production launch requires:

- Exact public name and preferred headline
- Current role and affiliation
- Approved short and long biography
- Headshot or an explicit decision not to use one
- Public contact method
- GitHub, Scholar, ORCID, and LinkedIn URLs as applicable
- Current CV PDF
- Confirmed project titles, descriptions, collaborators, dates, and public links
- Publication and other research-output metadata
- Rights-cleared figures with captions and alternative-text context
- Desired custom domain

## Delivery Sequence

1. Initialize the Git repository and Astro project in an isolated feature
   worktree once a repository and default branch exist.
2. Define design tokens and typed content schemas.
3. Build the responsive application shell.
4. Implement the homepage and one complete project case study using verified
   content.
5. Implement Research, Projects, Papers, About, CV, and 404 pages.
6. Add metadata, structured data, sitemap, analytics, and final assets.
7. Run the verification strategy and correct findings.
8. Deploy a Cloudflare Pages preview for user review.
9. Connect and verify the custom domain after explicit approval.

## Success Criteria

The site is successful when:

- A new visitor can understand the research focus and current role within one
  screen and approximately 15 seconds.
- An academic reader can find research themes, outputs, collaborators, and CV
  without ambiguity.
- An industry reader can identify concrete contributions, validation evidence,
  code, and reproducibility decisions.
- The owner can add a project or publication by creating one validated content
  entry.
- The production site is accessible, responsive, fast, and portable.
- Every factual research claim is supported by owner-approved content.
