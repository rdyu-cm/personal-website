# Research Website Redesign

Date: 2026-07-30  
Status: Approved design

## Goal

Redesign Ryan Yu's website as a concise research profile with the polish and
clarity of a large technology company's research site. The public content
should primarily reflect résumé and LinkedIn information, while the About page
remains manually authored. The interface should feel atmospheric and
distinctive without making the writing verbose.

## Design Direction

The selected visual direction is **Twilight violet**:

- A deep violet background replaces the current near-black canvas.
- Soft lavender text replaces stark white body text.
- Pastel pink is the primary accent and pale cyan is the secondary accent.
- One orbital gradient form serves as the homepage's signature visual.
- Open layouts, generous spacing, and thin violet separators replace most
  card-like containers.
- Motion is restrained to a subtle hero entrance and responsive interaction
  states, with equivalent reduced-motion behavior.

The site should evoke a research organization rather than a generic space
dashboard. Space imagery is a controlled motif, not a content metaphor repeated
through every section.

## Reference Findings

The redesign combines two useful conventions:

1. Strong individual research sites put identity, current role, a short research
   thesis, external scholarly links, and recent outputs near the top.
2. Big-technology research sites keep navigation shallow, use strong spatial
   hierarchy, and present people, topics, and outputs as compact modular rows.

The existing site has the right underlying information, but repeats the same
research description across Home, Research, Projects, and About. The redesign
removes that repetition and assigns each page one clear purpose.

## Information Architecture

The primary navigation contains four routes:

1. Home
2. Research
3. Publications & Presentations
4. About

Projects is removed from navigation and public routing because all current
projects are research. Existing project content remains available internally
and is migrated or adapted for the Research page. This preserves a low-cost
path to restoring a separate Projects page when non-research projects exist.

The current `/papers` route is replaced by a publication-and-presentation route
with a clear, concise URL chosen during implementation. Old public routes should
redirect when the deployment platform supports redirects without adding
unnecessary client-side code; otherwise they may render a small canonical
handoff page or be omitted if no compatibility requirement exists in the
current site configuration.

## Page Design

### Home

Home is a compact professional overview.

The hero contains:

- Ryan Yu's name
- current academic role and affiliation
- one concise research statement derived from résumé/LinkedIn information
- primary links to Research and LinkedIn
- one orbital gradient visual

Below the hero, three current-research rows show:

- research topic
- lab and institution
- dates
- a short description
- a link to the corresponding Research section

A small latest-outputs section shows the newest publications and presentations.
The page ends with email, GitHub, and LinkedIn links.

The following current homepage material is removed as redundant:

- separate research-interest prose
- duplicated selected-project cards
- repeated workflow explanations
- verbose contact instructions

### Research

Research is the only detailed work page. It begins with one short overview,
then renders the three current research appointments.

Each research entry supports:

- title
- lab
- institution
- start and end dates
- status
- concise summary
- manually editable longer description
- methods or themes
- optional links and media

Entries should make Ryan's contribution and the research question clear without
turning into full case studies. The current data-to-insight workflow is removed
unless its content is needed within a specific research entry.

### Publications & Presentations

This page combines publications, preprints, posters, talks, and presentations in
one reverse-chronological list. Each entry supports:

- title
- authors
- venue
- date and date precision
- output type
- status
- optional DOI or external URL

Small type labels distinguish output categories. A filter appears only when the
number and variety of entries make it useful. The page title and navigation label
are always “Publications & Presentations.”

### About

About is manually authored and intentionally separate from structured résumé
facts. It contains Ryan's own prose and may include an optional public résumé or
CV link. The template should not add biography sections, appointments, or
methods automatically.

## Content Editing Model

Routine content updates should not require editing page templates.

- `src/data/profile.ts` stores structured identity facts: name, affiliation,
  degree or role, dates, homepage summary, external links, and optional public
  résumé/CV URL.
- `src/content/research/*.md` stores one editable Markdown record per research
  appointment.
- `src/content/publications/*.md` stores publications and presentations with a
  typed output category.
- `src/content/about.md` stores the manually authored About prose.
- `src/pages/*.astro` contains route templates and presentation logic only.

The exact collection migration should preserve existing publication metadata and
avoid speculative abstractions. If Astro's content collections require About to
live in a named collection, the implementation may use a singleton collection
while preserving the single-file editing experience.

## Visual System

### Color

The palette will be expressed with OKLCH tokens and verified for contrast:

- deep twilight violet canvas
- slightly lighter violet surface
- soft lavender primary ink
- muted lavender secondary ink
- pastel pink primary accent
- pale cyan secondary accent
- violet separators and focus treatment

Body text must meet WCAG AA contrast of at least 4.5:1. Large display text must
meet at least 3:1. Pure black and pure white should not be the primary canvas and
ink pair.

### Typography

Use a deliberate sans-serif system with clear weight and scale contrast. Avoid
default “tech” monospace styling and avoid an editorial serif/mono pairing.
Display text must remain at or above `-0.04em` letter spacing. Body text is
limited to approximately 65–75 characters per line.

### Layout

- Use a wide but bounded container.
- Give the hero more vertical breathing room than subsequent sections.
- Use grid only for meaningful two-dimensional alignment.
- Prefer rows and ruled groupings over repeated cards.
- Convert multi-column rows to stacked entries on narrow screens.
- Maintain comfortable tap targets and avoid horizontal overflow at 320px.

### Motion

The homepage may use one short coordinated entrance for the hero and orbital
form. Hover and focus transitions should be subtle and fast. Content must remain
visible by default, and `prefers-reduced-motion` must remove or simplify all
nonessential motion.

## Accessibility and Resilience

- Preserve the skip link and semantic page landmarks.
- Maintain one primary heading per page and logical heading order.
- Keep visible keyboard focus states.
- Ensure navigation remains usable on small screens without an unnecessary menu
  dependency when four links can wrap or scroll cleanly.
- Give meaningful images nonblank alternative text and mark decorative imagery
  as decorative.
- Omit absent optional content rather than rendering blank labels.
- Keep external links understandable without relying solely on icons.

## SEO and Structured Data

- Update titles, descriptions, canonical routes, sitemap output, and navigation
  labels for the new information architecture.
- Preserve Person JSON-LD on Home and About.
- Preserve ScholarlyArticle JSON-LD for qualifying publication entries.
- Do not apply ScholarlyArticle structured data to talks or posters when it would
  be semantically incorrect.
- Update social preview metadata if the redesign changes its visual identity.

## Implementation Boundaries

- Keep Astro and the existing content-collection architecture.
- Do not add React, a component framework, or an animation dependency.
- Do not add a CMS or résumé parser.
- Do not create a public Projects route until requested in the future.
- Do not fabricate research, publication, presentation, résumé, or biographical
  content. Existing verified content may be reorganized and shortened.
- Preserve privacy constraints around the currently ignored résumé PDF unless
  the user explicitly supplies and authorizes a public CV asset.

## Verification

Implementation is complete only after:

- formatting checks pass
- Astro type checks pass
- unit tests pass
- the production build succeeds
- end-to-end tests pass
- Axe reports no violations on all public pages
- pages do not overflow a 320px viewport
- desktop and mobile visual checks confirm spacing, hierarchy, navigation, and
  the selected twilight-violet palette
- reduced-motion behavior is verified
- obsolete labels and public navigation links for Projects, Papers, and
  “Research outputs” are absent

## Success Criteria

The finished site should let a visitor answer these questions within one screen:

- Who is Ryan Yu?
- Where does he currently study or work?
- What scientific problems does he work on?
- Where can I see his research and outputs?

It should feel more polished and visually expressive than a conventional
academic template, while remaining factual, easy to maintain, accessible, and
ready to expand with a future Projects page.
