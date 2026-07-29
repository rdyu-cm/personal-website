import { describe, expect, test } from "vitest";

import { profile } from "../src/data/profile";
import {
  buildPersonJsonLd,
  buildScholarlyArticleJsonLd,
  publicationFragmentId,
} from "../src/lib/structured-data";

const publication = (
  overrides: Partial<{
    type: string;
    status: string;
    venue: string;
    date: Date;
    datePrecision: "year" | "month" | "day";
    links: { doi?: string };
  }> = {},
) => ({
  id: "example-publication",
  data: {
    title: "A careful scientific record",
    authors: ["Ryan Yu", "Example Collaborator"],
    date: new Date("2025-03-14T00:00:00.000Z"),
    datePrecision: "day" as const,
    type: "Journal",
    status: "Published",
    venue: "Example Journal",
    themes: ["Molecular simulation"],
    featured: false,
    draft: false,
    ...overrides,
  },
});

describe("buildPersonJsonLd", () => {
  test("uses the exact public profile identity and excludes email from sameAs", () => {
    expect(buildPersonJsonLd(profile)).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Ryan Yu",
      url: "https://rdyu-cm.github.io/personal-website",
      affiliation: {
        "@type": "Organization",
        name: "California Institute of Technology",
      },
      sameAs: [
        "https://github.com/rdyu-cm",
        "https://www.linkedin.com/in/ryan-yu-0bb27a23b",
      ],
    });
  });

  test("uses the configured canonical URL when one is supplied", () => {
    expect(
      buildPersonJsonLd(profile, "https://research.example.com"),
    ).toMatchObject({ url: "https://research.example.com" });
  });

  test("omits optional fields instead of serializing undefined values", () => {
    const jsonLd = buildPersonJsonLd({
      ...profile,
      affiliation: undefined,
      links: [{ label: "Email", href: "mailto:rdyu@caltech.edu" }],
    });

    expect(jsonLd).not.toHaveProperty("affiliation");
    expect(jsonLd).not.toHaveProperty("sameAs");
    expect(JSON.stringify(jsonLd)).not.toContain("undefined");
  });
});

describe("buildScholarlyArticleJsonLd", () => {
  test("represents a published journal record with its verified periodical", () => {
    const article = buildScholarlyArticleJsonLd(
      publication({
        date: new Date("2026-01-01T00:00:00.000Z"),
        datePrecision: "year",
        venue: "Proceedings of the National Academy of Sciences",
        links: { doi: "https://doi.org/10.1073/pnas.2604658123" },
      }),
      "https://example.com/papers#example-publication",
    );

    expect(article).toMatchObject({
      "@type": "ScholarlyArticle",
      datePublished: "2026",
      isPartOf: {
        "@type": "Periodical",
        name: "Proceedings of the National Academy of Sciences",
      },
      sameAs: "https://doi.org/10.1073/pnas.2604658123",
    });
  });

  test("omits a venue container for a published conference record", () => {
    const jsonLd = buildScholarlyArticleJsonLd(
      publication({ type: "conference", venue: "Example Conference" }),
      "https://example.com/papers#example-publication",
    );

    expect(jsonLd).toMatchObject({ datePublished: "2025-03-14" });
    expect(jsonLd).not.toHaveProperty("isPartOf");
  });

  test("omits a venue container for a published preprint record", () => {
    const jsonLd = buildScholarlyArticleJsonLd(
      publication({ type: "preprint", venue: "Example Repository" }),
      "https://example.com/papers#example-publication",
    );

    expect(jsonLd).toMatchObject({ datePublished: "2025-03-14" });
    expect(jsonLd).not.toHaveProperty("isPartOf");
  });

  test("omits publication claims for a submitted preprint record", () => {
    const jsonLd = buildScholarlyArticleJsonLd(
      publication({
        type: " Preprint ",
        status: "Submitted",
        venue: "Example Repository",
      }),
      "https://example.com/papers#example-publication",
    );

    expect(jsonLd).not.toHaveProperty("datePublished");
    expect(jsonLd).not.toHaveProperty("isPartOf");
  });

  test("does not represent a manuscript as a ScholarlyArticle", () => {
    expect(
      buildScholarlyArticleJsonLd(
        publication({
          type: "Manuscript",
          status: "Submitted",
          venue: undefined,
        }),
        "https://example.com/papers#example-publication",
      ),
    ).toBeUndefined();
  });
});

describe("publicationFragmentId", () => {
  test("derives a stable base-safe HTML fragment from an entry id", () => {
    const id = publicationFragmentId("Future Paper / β v2");

    expect(id).toMatch(/^publication-[a-z0-9]+$/);
    expect(publicationFragmentId("Future Paper / β v2")).toBe(id);
    expect(publicationFragmentId("Future Paper / β v3")).not.toBe(id);
  });
});
