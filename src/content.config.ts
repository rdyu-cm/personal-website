import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const externalLinksSchema = z.object({
  doi: z.url().optional(),
  preprint: z.url().optional(),
  code: z.url().optional(),
  slides: z.url().optional(),
  bibtex: z.url().optional(),
  project: z.url().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      datePrecision: z.enum(["year", "month", "day"]),
      status: z.string(),
      themes: z.array(z.string()).min(1),
      role: z.string(),
      featured: z.boolean(),
      draft: z.boolean(),
      collaborators: z.array(z.string()).optional(),
      heroImage: z.string().optional(),
      heroAlt: z.string().trim().min(1).optional(),
      resultSummary: z.string().trim().min(1).optional(),
      links: externalLinksSchema.optional(),
    })
    .refine(
      (project) => !project.heroImage || Boolean(project.heroAlt?.trim()),
      {
        message: "heroAlt is required when heroImage is provided",
        path: ["heroAlt"],
      },
    ),
});

const publications = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    date: z.coerce.date(),
    datePrecision: z.enum(["year", "month", "day"]),
    type: z.enum(["journal", "conference", "preprint", "manuscript"]),
    status: z.string(),
    themes: z.array(z.string()).min(1),
    featured: z.boolean(),
    draft: z.boolean(),
    venue: z.string().optional(),
    summary: z.string().optional(),
    links: externalLinksSchema.optional(),
  }),
});

export const collections = { projects, publications };
