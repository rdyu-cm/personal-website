import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const canonicalSite = "https://rdyu-cm.github.io/personal-website";
const site = process.env.SITE_URL ?? canonicalSite;
const base = new URL(site).pathname.replace(/\/$/, "") || undefined;

// Astro reports the index route both with and without a trailing slash.
// `trailingSlash: "never"` then collapses the pair into duplicate <loc>
// entries, so drop any URL already emitted under its normalized form.
export const createSitemapFilter = () => {
  const emitted = new Set();

  return (page) => {
    const normalized = page.replace(/\/+$/, "");
    if (emitted.has(normalized)) return false;
    emitted.add(normalized);
    return true;
  };
};

export default defineConfig({
  output: "static",
  site,
  base,
  trailingSlash: "never",
  integrations: [mdx(), sitemap({ filter: createSitemapFilter() })],
});
