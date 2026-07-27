import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const canonicalSite = "https://rdyu-cm.github.io/personal-website";

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL ?? canonicalSite,
  base: process.env.SITE_URL ? "/personal-website" : undefined,
  integrations: [mdx(), sitemap()],
});
