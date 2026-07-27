import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

import {
  filterPublicEntries,
  sortByDateDescending,
  takeFeatured,
} from "../src/lib/content";

const readSource = (path: string) =>
  readFileSync(resolve(import.meta.dirname, "..", path), "utf8");

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

  test("returns the newest public featured entries up to the requested limit", () => {
    const featuredEntries = [
      entries[0],
      entries[1],
      entries[2],
      {
        id: "newest-featured",
        data: { date: new Date("2026-01-01"), draft: false, featured: true },
      },
      {
        id: "middle-featured",
        data: { date: new Date("2025-03-01"), draft: false, featured: true },
      },
    ];

    expect(takeFeatured(featuredEntries, 2).map((entry) => entry.id)).toEqual([
      "newest-featured",
      "middle-featured",
    ]);
  });
});

describe("content schemas", () => {
  test("requires explicit date precision in both collection schemas and records", () => {
    const schema = readSource("src/content.config.ts");

    expect(
      schema.match(/datePrecision: z\.enum\(\["year", "month", "day"\]\)/g),
    ).toHaveLength(2);
    for (const record of [
      "src/content/projects/smoothened-gi.md",
      "src/content/projects/nitrate-reduction-electrolytes.md",
      "src/content/publications/smoothened-ligand-activation.md",
    ]) {
      expect(readSource(record)).toContain("datePrecision: year");
    }
  });

  test("trims and requires hero alt text when a hero image is supplied", () => {
    expect(readSource("src/content.config.ts")).toContain(
      "project.heroAlt?.trim()",
    );
  });
});
