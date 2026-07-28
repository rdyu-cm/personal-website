import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("Astro.site is required to generate robots.txt.");

  const basePath = site.pathname.replace(/\/$/, "");
  const sitemap = new URL(`${basePath}/sitemap-index.xml`, site.origin);

  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${sitemap.toString()}\n`,
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
};
