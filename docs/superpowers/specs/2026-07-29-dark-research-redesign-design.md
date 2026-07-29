# Dark Research Portfolio Redesign

Date: 2026-07-29  
Status: Approved design, pending implementation plan

## Objective

Redesign Ryan Yu's public research portfolio as a compact, dark, AI-for-science
site and update its research record from current public profile information.
The result should feel sleek and technically serious without turning into a
generic space-themed template.

The redesign keeps the existing Astro static-site architecture, typed content
collections, deployment target, privacy constraints, and page structure where
they still serve the content.

## Audience and communication goal

The primary audience is research faculty, graduate students, collaborators, and
technical recruiters. A visitor should understand within the first viewport
that Ryan works across interpretable machine learning, molecular simulation,
and chemical mechanisms. Current research should be more prominent than
biographical detail.

Brand voice:

- Precise
- Exploratory
- Mechanistic

## Scope

### Included

- Replace the light cobalt visual system with the approved "Deep Orbit" dark
  system.
- Reduce display and section-heading sizes across the site.
- Keep an identity-first homepage headed by "Ryan Yu."
- Add compact "AI for science" and "Molecular simulation" tags to the homepage
  hero.
- Promote Current Research into a readable three-row homepage band.
- Add and update Rotskoff, Fong, and Goddard research content.
- Update the Smoothened publication to its published PNAS record and DOI.
- Add LinkedIn as a public profile link.
- Remove the CV route and every CV navigation or content reference.
- Retain subtle hover and focus transitions with reduced-motion fallbacks.

### Explicitly excluded

- Canvas, WebGL, GIF, video, or animated scientific interactives.
- A periodic electrolyte toy simulation.
- A sparse-autoencoder node animation.
- A Smoothened activation animation or cartoon.
- A downloadable resume or public resume PDF.
- A phone number.
- A theme switcher or light theme.
- New server-side behavior or Cloudflare runtime compute.

The excluded scientific interactives were intentionally deferred. Private local
brainstorming notes may preserve those ideas, but they are not implementation
requirements and must not be published.

## Information architecture

The primary navigation becomes:

1. Home
2. Research
3. Projects
4. Papers
5. About

The `/cv` page is deleted. No replacement route, redirect, resume download, or
navigation item is added. Requests to `/cv` use the existing branded 404
behavior.

Email, GitHub, and LinkedIn remain available in the homepage contact section and
footer. LinkedIn points to:

`https://www.linkedin.com/in/ryan-yu-0bb27a23b`

## Content model and research updates

### Shared profile

The shared profile should describe Ryan as a Caltech Chemical Engineering
(Computational) undergraduate working across interpretable protein
representations, machine-learned interatomic potentials, and molecular
simulation.

The profile data remains the single source for name, headline, summary,
affiliation, email, GitHub, and LinkedIn.

### Rotskoff Lab

Affiliation: Stanford University  
Role: Student Researcher  
Dates: June 2026–present

Approved description:

> Trained sparse autoencoders on BioEmu and ESM3 representations to extract
> interpretable features corresponding to structural and
> conformational-distribution properties in proteins.

Add a typed, public Rotskoff project entry. It appears first in Current Research,
the Research page, and relevant project lists because it is the newest role.

### Fong Lab

Affiliation: California Institute of Technology  
Role: Student Researcher  
Dates: December 2024–present

Approved description:

> Conducted molecular dynamics and density functional theory calculations in
> LAMMPS and CP2K to train a MACE machine-learned interatomic potential for the
> interfacial environment in electrochemical nitrate reduction.

Existing Fong project content should be reconciled with this description,
retaining accurate existing detail about aqueous nitrate, alkali cations, and
the TiH2/electrolyte interface where it does not conflict.

### Goddard Lab

Affiliation: California Institute of Technology  
Role: Student Researcher  
Dates: December 2023–present

Approved description:

> Modeled the oncoprotein Smoothened with molecular dynamics and metadynamics
> in GROMACS and PLUMED. Determined the precoupled state and the mechanism for
> ligand activation of Smoothened.

The Research and About pages should distinguish this mechanism work from the
newer protein-representation work rather than collapsing both into a generic
"biomolecular simulation" label.

### Publication

Replace the submitted-manuscript record with:

- Title: The Mechanism for Ligand Activation of the Smoothened G
  Protein-Coupled Receptor
- Authors: Ryan D. Yu, Amy-Doan P. Vo, Soo-Kyung Kim, William A. Goddard III
- Venue: Proceedings of the National Academy of Sciences
- Status: Published
- Year: 2026
- DOI: `https://doi.org/10.1073/pnas.2604658123`

The publication summary should describe the G-protein-first activation pathway
at a high level without adding unsupported claims.

## Homepage design

### Hero

The homepage remains identity-first:

- Tags: "AI for science" and "Molecular simulation"
- Heading: "Ryan Yu"
- Compact thesis:
  "Interpretable protein representations, machine-learned potentials, and
  molecular mechanisms."

The hero should occupy substantially less vertical space than the current
version. It should read as a deliberate introduction, not an oversized landing
page billboard.

### Current Research band

Current Research is a primary homepage section directly after the hero. It uses
three full-width rows:

1. Rotskoff Lab
2. Fong Lab
3. Goddard Lab

Each row contains a clearly readable lab name and one concise description.
Research text must use the normal body scale or larger; it must not be rendered
as metadata or fine print.

### Remaining homepage sections

Research interests, selected projects, papers, and contact remain, but their
heading scale and vertical spacing are reduced. Avoid converting every section
into identical cards. Lists and ruled rows remain the primary organizational
device.

## Visual system

### Physical scene and reference

The site should feel like a researcher reviewing simulation results on a
low-light workstation: controlled contrast, luminous analytical accents, and
enough negative space to separate ideas. It should not use a literal starfield,
decorative grid, galaxy photograph, or generic neon dashboard treatment.

### Color strategy

Use a committed dark palette:

- Near-black indigo canvas
- Slightly elevated indigo surfaces
- Soft near-white lavender text
- Periwinkle as the primary accent
- Cyan as the scientific/action accent

Initial OKLCH targets:

| Role | Target |
| --- | --- |
| Canvas | `oklch(0.12 0.025 275)` |
| Surface | `oklch(0.16 0.035 275)` |
| Strong surface | `oklch(0.21 0.045 275)` |
| Primary text | `oklch(0.94 0.02 275)` |
| Muted text | `oklch(0.76 0.035 275)` |
| Border | `oklch(0.35 0.055 275)` |
| Periwinkle | `oklch(0.72 0.15 285)` |
| Cyan | `oklch(0.79 0.12 190)` |

Implementation may adjust lightness to meet contrast requirements. Normal text
must meet WCAG AA 4.5:1 contrast; large text and non-text controls must meet
their applicable thresholds.

Ambient color may use one or two low-opacity radial fields. No decorative
two-axis grid, repeating stripes, gradient text, or default glassmorphism.

### Typography

Retain a system-first sans-serif stack to avoid a new external font dependency.
Use weight and spacing rather than multiple decorative font families.

Target scale:

- Body: approximately 1rem–1.0625rem
- Small/meta: approximately 0.8125rem–0.875rem
- H3: approximately 1.25rem–1.5rem
- H2: approximately 1.75rem–2.4rem
- H1: approximately 2.75rem–4rem

Display letter spacing stays at or above `-0.04em`. Body line length remains
between approximately 65 and 72 characters.

### Surfaces and layout

- Keep border radii at or below 12–14px for panels.
- Prefer ruled rows and simple surfaces over repeated bordered cards.
- Do not combine wide soft shadows with 1px decorative borders.
- Use the approved identity-first composition on the homepage.
- Alternate surface tones sparingly to establish page rhythm.
- Preserve responsive behavior down to a 320px viewport.

## Page-level changes

### Research

Order research by current relevance: Rotskoff, Fong, Goddard. Preserve the
data-to-insight workflow but reduce its heading size and surrounding whitespace.
Each research section should include methods, scientific question, and current
status in readable prose.

### Projects

Add the Rotskoff project to the typed collection and project index. Existing
project-detail structure remains. Project summaries and status labels should
use the updated research wording.

### Papers

Display the PNAS publication as Published in 2026 with a DOI link. Keep the
compact publication-list treatment.

### About

Update the trajectory to include Stanford/Rotskoff in 2026, then Fong and
Goddard at Caltech. Avoid vanity metrics, follower counts, location history, or
unrelated honors.

### CV removal

Delete the CV page, navigation entry, and CV-specific tests and documentation.
Keep the repository-root resume PDF ignored and unpublished.

## Motion and interaction

Motion is limited to:

- Link, navigation, and button color transitions
- Subtle surface or accent transitions on hover/focus

Do not hide content pending animation. Under
`prefers-reduced-motion: reduce`, transitions become effectively immediate and
smooth scrolling remains disabled as it is today.

## Accessibility and privacy

- Preserve semantic landmarks, single page H1s, heading order, skip link, and
  visible keyboard focus.
- Maintain readable dark-theme contrast.
- Preserve meaningful link names.
- Ensure no horizontal overflow at 320px.
- Do not publish the resume PDF, phone number, private research data, model
  outputs, trajectories, or unpublished figures.
- Use only the public LinkedIn URL and supplied professional descriptions.

## Technical approach

- Continue using static Astro output and Workers Static Assets.
- Keep content in typed Astro collections and shared identity in profile data.
- Centralize the dark palette and type scale in `src/styles/global.css`.
- Make page-specific layout changes within existing Astro pages and components.
- Avoid new runtime dependencies.
- Keep JavaScript at zero unless an implementation detail demonstrably requires
  it; none is currently planned.
- Preserve `SITE_URL` behavior and the canonical Worker fallback.

## Testing and verification

Update unit tests to verify:

- Rotskoff, Fong, and Goddard content and ordering
- Published PNAS metadata and DOI
- LinkedIn profile link
- No CV route or navigation entry
- Resume PDF and phone number remain absent

Update browser tests to verify:

- Five-item navigation without CV
- `/cv` returns the branded 404 behavior
- Current Research rows are visible and readable
- Every public page has no automated Axe violations
- No heading-level skips
- No 320px horizontal overflow
- Reduced-motion behavior remains usable

Release verification:

1. Formatting check
2. Astro diagnostics
3. Full unit suite
4. Chromium and Pixel 7 browser suite
5. Production build
6. Wrangler dry run
7. Inspect generated canonical URLs and root-relative asset paths
8. Live deployment smoke check after merge and push

## Acceptance criteria

The redesign is complete when:

- The deployed site uses the approved Deep Orbit visual system consistently.
- No primary heading exceeds the approved compact scale.
- The homepage leads with identity and gives Current Research full readable
  prominence.
- All three research roles use the supplied current descriptions.
- The PNAS paper is represented as published with the correct DOI.
- LinkedIn is available as a public profile link.
- CV is absent from navigation, generated routes, and public copy.
- No research interactive functionality is present.
- Accessibility, privacy, tests, build, and Wrangler validation pass.
