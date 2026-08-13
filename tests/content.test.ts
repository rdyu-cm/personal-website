import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

import { filterPublicEntries, sortByDateDescending } from "../src/lib/content";
import { availableExternalLinks } from "../src/lib/external-links";

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
  test("labels only configured external research and publication links", () => {
    expect(
      availableExternalLinks({
        doi: "https://doi.org/10.1000/example",
        code: "https://github.com/example/repository",
      }),
    ).toEqual([
      { href: "https://doi.org/10.1000/example", label: "DOI" },
      { href: "https://github.com/example/repository", label: "Code" },
    ]);
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

  test("includes a schema-valid optional link on a research record", () => {
    expect(readSource("src/content/research/smoothened-gi.md")).toContain(
      'doi: "https://doi.org/10.1073/pnas.2604658123"',
    );
  });

  test("requires explicit date precision in both collection schemas and records", () => {
    const schema = readSource("src/content.config.ts");

    expect(
      schema.match(/datePrecision: z\.enum\(\["year", "month", "day"\]\)/g),
    ).toHaveLength(2);
    for (const record of [
      "src/content/research/rotskoff-protein-representations.md",
      "src/content/research/smoothened-gi.md",
      "src/content/research/nitrate-reduction-electrolytes.md",
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
  test("publishes the three current research appointments in newest-first order", () => {
    const records = [
      "src/content/research/rotskoff-protein-representations.md",
      "src/content/research/nitrate-reduction-electrolytes.md",
      "src/content/research/smoothened-gi.md",
    ].map(readSource);

    // Pin each record by its lab rather than by model or tool names, which
    // change as the work does.
    expect(records[0]).toContain("date: 2026-06-01");
    expect(records[0]).toContain('lab: "Rotskoff Lab"');
    expect(records[1]).toContain("date: 2024-12-01");
    expect(records[1]).toContain('lab: "Fong Lab"');
    expect(records[2]).toContain("date: 2023-12-01");
    expect(records[2]).toContain('lab: "Goddard Lab"');
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
