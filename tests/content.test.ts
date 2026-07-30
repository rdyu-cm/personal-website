import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

import {
  canFilterPublications,
  filterPublicEntries,
  filterPublications,
  normalizePublicationType,
  publicationFilterOptions,
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
  test("normalizes publication types to lowercase comparison keys", () => {
    expect(normalizePublicationType("  Preprint \n")).toBe("preprint");
  });

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
  test("does not offer a publication filter below the public-entry threshold", () => {
    const publications = Array.from({ length: 7 }, (_, index) => ({
      id: `publication-${index}`,
      data: {
        date: new Date(`202${index % 2}-01-01T00:00:00.000Z`),
        draft: false,
        featured: false,
        type: index % 2 === 0 ? "Article" : "Preprint",
      },
    }));

    expect(canFilterPublications(publications, "type")).toBe(false);
  });

  test("does not offer a publication filter when its chosen dimension has one meaningful value", () => {
    const publications = Array.from({ length: 8 }, (_, index) => ({
      id: `publication-${index}`,
      data: {
        date: new Date(`202${index % 3}-01-01T00:00:00.000Z`),
        draft: false,
        featured: false,
        type: "Manuscript",
      },
    }));

    expect(canFilterPublications(publications, "type")).toBe(false);
  });

  test("offers and applies a publication filter for eight public entries with two types", () => {
    const publications = [
      { id: "old-article", type: "Article", year: 2023, draft: false },
      { id: "new-preprint", type: "Preprint", year: 2025, draft: false },
      { id: "middle-article", type: "Article", year: 2024, draft: false },
      { id: "draft", type: "Preprint", year: 2026, draft: true },
      ...Array.from({ length: 5 }, (_, index) => ({
        id: `other-${index}`,
        type: index % 2 === 0 ? "Article" : "Preprint",
        year: 2022,
        draft: false,
      })),
    ].map(({ id, type, year, draft }) => ({
      id,
      data: {
        date: new Date(`${year}-01-01T00:00:00.000Z`),
        draft,
        featured: false,
        type,
      },
    }));
    const publicPublications = filterPublicEntries(publications);

    expect(sortByDateDescending(publications).map(({ id }) => id)).toEqual([
      "draft",
      "new-preprint",
      "middle-article",
      "old-article",
      "other-0",
      "other-1",
      "other-2",
      "other-3",
      "other-4",
    ]);
    expect(canFilterPublications(publicPublications, "type")).toBe(true);
    expect(publicationFilterOptions(publications, "type")).toEqual([
      { label: "Article", value: "article" },
      { label: "Preprint", value: "preprint" },
    ]);
    expect(
      filterPublications(publicPublications, "type", " PREPRINT ").map(
        ({ id }) => id,
      ),
    ).toEqual(["new-preprint", "other-1", "other-3"]);
  });
});

describe("content schemas", () => {
  test("defines research, publication, and singleton about collections", () => {
    const schema = readSource("src/content.config.ts");

    expect(schema).toContain("const research = defineCollection");
    expect(schema).toContain('base: "./src/content/research"');
    expect(schema).toContain(
      'type: z.enum(["journal", "conference", "preprint", "manuscript", "poster", "talk", "presentation"])',
    );
    expect(schema).toContain("const about = defineCollection");
    expect(schema).toMatch(/export const collections = \{[^}]*projects/);
    expect(schema).toMatch(/export const collections = \{[^}]*research/);
    expect(schema).toMatch(/export const collections = \{[^}]*publications/);
    expect(schema).toMatch(/export const collections = \{[^}]*about/);
  });

  test("keeps editable descriptions out of page templates", () => {
    expect(readSource("src/content/about/about.md")).toContain("Ryan Yu");
    for (const id of [
      "rotskoff-protein-representations",
      "nitrate-reduction-electrolytes",
      "smoothened-gi",
    ]) {
      expect(readSource(`src/content/research/${id}.md`)).toContain("summary:");
    }
  });

  test("requires explicit date precision in both collection schemas and records", () => {
    const schema = readSource("src/content.config.ts");

    expect(
      schema.match(/datePrecision: z\.enum\(\["year", "month", "day"\]\)/g),
    ).toHaveLength(3);
    for (const record of [
      "src/content/projects/rotskoff-protein-representations.md",
      "src/content/projects/smoothened-gi.md",
      "src/content/projects/nitrate-reduction-electrolytes.md",
    ]) {
      expect(readSource(record)).toContain("datePrecision: month");
    }
    expect(
      readSource("src/content/publications/smoothened-ligand-activation.md"),
    ).toContain("datePrecision: year");
  });

  test("uses lowercase publication type enums including presentation records", () => {
    expect(readSource("src/content.config.ts")).toContain(
      'type: z.enum(["journal", "conference", "preprint", "manuscript", "poster", "talk", "presentation"])',
    );
  });

  test("trims and requires hero alt text when a hero image is supplied", () => {
    expect(readSource("src/content.config.ts")).toContain(
      "project.heroAlt?.trim()",
    );
  });
});

describe("resume privacy ignore", () => {
  const isIgnored = (path: string) => {
    try {
      execFileSync("git", ["check-ignore", "--quiet", "--", path], {
        cwd: resolve(import.meta.dirname, ".."),
      });
      return true;
    } catch {
      return false;
    }
  };

  test("ignores only the resume PDF at the root", () => {
    expect(isIgnored("Yu_Ryan_Resume.pdf")).toBe(true);
    expect(isIgnored("public/Yu_Ryan_Resume.pdf")).toBe(false);
    expect(isIgnored("public/cv/Yu_Ryan_Resume.pdf")).toBe(false);
  });
});

describe("current public research record", () => {
  test("publishes the three current research projects in newest-first order", () => {
    const records = [
      "src/content/projects/rotskoff-protein-representations.md",
      "src/content/projects/nitrate-reduction-electrolytes.md",
      "src/content/projects/smoothened-gi.md",
    ].map(readSource);

    expect(records[0]).toContain("date: 2026-06-01");
    expect(records[0]).toContain("BioEmu and ESM3");
    expect(records[1]).toContain("date: 2024-12-01");
    expect(records[1]).toContain("LAMMPS and CP2K");
    expect(records[2]).toContain("date: 2023-12-01");
    expect(records[2]).toContain("GROMACS and PLUMED");
  });

  test("publishes the PNAS article and DOI", () => {
    const publication = readSource(
      "src/content/publications/smoothened-ligand-activation.md",
    );

    expect(publication).toContain('type: "journal"');
    expect(publication).toContain('status: "Published"');
    expect(publication).toContain("date: 2026-01-01");
    expect(publication).toContain(
      'venue: "Proceedings of the National Academy of Sciences"',
    );
    expect(publication).toContain(
      'doi: "https://doi.org/10.1073/pnas.2604658123"',
    );
  });

  test("adds LinkedIn and keeps private contact fields absent", () => {
    const profile = readSource("src/data/profile.ts");

    expect(profile).toContain("https://www.linkedin.com/in/ryan-yu-0bb27a23b");
    expect(profile).not.toMatch(/\b\d{3}[-.)\s]\d{3}[-.]\d{4}\b/);
    expect(profile).not.toContain("cvPath");
  });
});
