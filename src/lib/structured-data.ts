import type { Profile } from "../data/profile";
import { formatBehavioralDate, type DatePrecision } from "./dates";

type PublicationEntry = {
  data: {
    title: string;
    authors: string[];
    date: Date;
    datePrecision: DatePrecision;
    type: string;
    status: string;
    venue?: string;
  };
};
export const publicationFragmentId = (entryId: string) =>
  `publication-${[...new TextEncoder().encode(entryId)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;

const httpUrl = /^https?:\/\//i;
const scholarlyTypes = new Set(["journal", "conference", "preprint"]);

export const buildPersonJsonLd = (
  profile: Profile,
  canonicalUrl = profile.domain,
) => {
  const sameAs = profile.links
    .map(({ href }) => href.trim())
    .filter((href) => httpUrl.test(href));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: canonicalUrl,
    ...(profile.affiliation
      ? {
          affiliation: {
            "@type": "Organization",
            name: profile.affiliation,
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
};

export const buildScholarlyArticleJsonLd = (
  entry: PublicationEntry,
  url: string,
) => {
  const publicationType = entry.data.type.trim().toLowerCase();
  if (!scholarlyTypes.has(publicationType)) return undefined;

  const isPublished = entry.data.status.trim().toLowerCase() === "published";
  const venue = entry.data.venue?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: entry.data.title,
    author: entry.data.authors.map((name) => ({
      "@type": "Person",
      name,
    })),
    url,
    ...(isPublished
      ? {
          datePublished: formatBehavioralDate(
            entry.data.date,
            entry.data.datePrecision,
          ).datetime,
        }
      : {}),
    ...(isPublished && publicationType === "journal" && venue
      ? {
          isPartOf: {
            "@type": "Periodical",
            name: venue,
          },
        }
      : {}),
  };
};
