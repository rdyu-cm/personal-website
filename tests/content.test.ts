import { describe, expect, test } from "vitest";

import {
  filterPublicEntries,
  sortByDateDescending,
  takeFeatured,
} from "../src/lib/content";

const entries = [
  {
    id: "earlier-featured",
    data: {
      date: new Date("2024-06-01"),
      draft: false,
      featured: true,
    },
  },
  {
    id: "draft-featured",
    data: {
      date: new Date("2025-06-01"),
      draft: true,
      featured: true,
    },
  },
  {
    id: "newer-public",
    data: {
      date: new Date("2025-01-01"),
      draft: false,
      featured: false,
    },
  },
];

describe("content selectors", () => {
  test("excludes draft entries", () => {
    expect(filterPublicEntries(entries).map((entry) => entry.id)).toEqual([
      "earlier-featured",
      "newer-public",
    ]);
  });

  test("sorts entries newest first without mutating its input", () => {
    const before = entries.map((entry) => entry.id);

    expect(sortByDateDescending(entries).map((entry) => entry.id)).toEqual([
      "draft-featured",
      "newer-public",
      "earlier-featured",
    ]);
    expect(entries.map((entry) => entry.id)).toEqual(before);
  });

  test("returns only public featured entries in newest-first order", () => {
    expect(takeFeatured(entries, 2).map((entry) => entry.id)).toEqual([
      "earlier-featured",
    ]);
  });
});
