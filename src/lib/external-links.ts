export const externalLinkLabels = {
  doi: "DOI",
  preprint: "Preprint",
  code: "Code",
  slides: "Slides",
  bibtex: "BibTeX",
  project: "Project",
} as const;

type ExternalLinkKey = keyof typeof externalLinkLabels;
type ExternalLinks = Partial<Record<ExternalLinkKey, string | undefined>>;

export function availableExternalLinks(links?: ExternalLinks) {
  return (
    Object.entries(links ?? {}) as [ExternalLinkKey, string | undefined][]
  ).flatMap(([key, href]) =>
    href ? [{ href, label: externalLinkLabels[key] }] : [],
  );
}
