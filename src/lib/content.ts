type Entry = {
  id: string;
  data: {
    date: Date;
    draft: boolean;
    featured: boolean;
  };
};

export const filterPublicEntries = <T extends Entry>(xs: T[]) =>
  xs.filter((entry) => !entry.data.draft);

export const sortByDateDescending = <T extends Entry>(xs: T[]) =>
  [...xs].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const takeFeatured = <T extends Entry>(xs: T[], limit: number) =>
  sortByDateDescending(filterPublicEntries(xs))
    .filter((entry) => entry.data.featured)
    .slice(0, limit);

type FilterablePublication = Entry & {
  data: {
    type: string;
  };
};

export type PublicationFilterDimension = "type";

export const normalizePublicationType = (value: string) =>
  value.trim().toLowerCase();

export const publicationTypeLabel = (value: string) => {
  const normalized = normalizePublicationType(value);
  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : normalized;
};

export const publicationFilterOptions = <T extends FilterablePublication>(
  xs: T[],
  _dimension: PublicationFilterDimension,
) =>
  [
    ...new Set(
      xs
        .map((entry) => normalizePublicationType(entry.data.type))
        .filter(Boolean),
    ),
  ]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: publicationTypeLabel(value), value }));

export const canFilterPublications = <T extends FilterablePublication>(
  xs: T[],
  dimension: PublicationFilterDimension,
) => xs.length >= 8 && publicationFilterOptions(xs, dimension).length >= 2;

export const filterPublications = <T extends FilterablePublication>(
  xs: T[],
  _dimension: PublicationFilterDimension,
  value: string,
) => {
  const normalizedValue = normalizePublicationType(value);

  return normalizedValue === "all"
    ? xs
    : xs.filter(
        (entry) =>
          normalizePublicationType(entry.data.type) === normalizedValue,
      );
};
