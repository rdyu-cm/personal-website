type Entry = {
  id: string;
  data: {
    date: Date;
    draft: boolean;
  };
};

export const filterPublicEntries = <T extends Entry>(xs: T[]) =>
  xs.filter((entry) => !entry.data.draft);

export const sortByDateDescending = <T extends Entry>(xs: T[]) =>
  [...xs].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
