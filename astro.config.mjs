import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const canonicalSite = "https://site.rdyu-cm.workers.dev";
const site = process.env.SITE_URL ?? canonicalSite;
const base = new URL(site).pathname.replace(/\/$/, "") || undefined;

export default defineConfig({
  output: "static",
  site,
  base,
  trailingSlash: "never",
  integrations: [mdx(), sitemap()],
});
