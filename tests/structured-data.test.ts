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
      sameAs: ["https://github.com/rdyu-cm"],
    });
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
    expect(
      buildScholarlyArticleJsonLd(
        publication(),
        "https://example.com/papers#example-publication",
      ),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      headline: "A careful scientific record",
      author: [
        { "@type": "Person", name: "Ryan Yu" },
        { "@type": "Person", name: "Example Collaborator" },
      ],
      url: "https://example.com/papers#example-publication",
      datePublished: "2025-03-14",
      isPartOf: {
        "@type": "Periodical",
        name: "Example Journal",
      },
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
