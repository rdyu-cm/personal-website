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
