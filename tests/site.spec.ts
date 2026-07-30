import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const auditedPaths = [
  "/",
  "/research",
  "/projects",
  "/projects/nitrate-reduction-electrolytes",
  "/projects/smoothened-gi",
  "/papers",
  "/about",
  "/cv",
];

test.describe("accessibility regression checks", () => {
  test("public pages have no Axe violations", async ({ page }) => {
    for (const path of auditedPaths) {
      await page.goto(path);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  });

  test("public pages do not overflow a 320px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    for (const path of auditedPaths) {
      await page.goto(path);
      expect(
        await page
          .locator("html")
          .evaluate(
            (element: HTMLElement) =>
              element.scrollWidth <= element.clientWidth,
          ),
      ).toBe(true);
    }
  });

  test("every rendered research image has nonblank alternative text", async ({
    page,
  }) => {
    await page.goto("/research");
    const researchImages = page.locator("main img");
    for (let image = 0; image < (await researchImages.count()); image += 1) {
      await expect(researchImages.nth(image)).toHaveAttribute("alt", /\S/);
    }
  });

  test("public pages do not skip heading levels", async ({ page }) => {
    for (const path of auditedPaths) {
      await page.goto(path);
      const levels = await page
        .locator("main :is(h1, h2, h3, h4, h5, h6)")
        .evaluateAll((headings) =>
          headings.map((heading) => Number(heading.tagName.slice(1))),
        );
      expect(levels[0]).toBe(1);
      for (let index = 1; index < levels.length; index += 1) {
        expect(levels[index]).toBeLessThanOrEqual(levels[index - 1] + 1);
      }
    }
  });

  test("research appointments remain visible with reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/research");
    await expect(page.locator(".research-entry")).toHaveCount(3);
  });
});

test("shared shell exposes page landmarks", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/favicon.svg",
  );
});

test("shared SEO exposes the Deep Orbit social preview", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#251f37",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "http://127.0.0.1:4321/social-preview.png",
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    "content",
    "1200",
  );
  await expect(
    page.locator('meta[property="og:image:height"]'),
  ).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    "Ryan Yu — AI for science and molecular simulation",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

test("skip link is first in the focus order and moves focus to main", async ({
  page,
}) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("primary navigation exposes the four-page research profile", async ({
  page,
}) => {
  await page.goto("/");

  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  for (const [name, href] of [
    ["Home", "/"],
    ["Research", "/research"],
    ["Publications & Presentations", "/publications"],
    ["About", "/about"],
  ]) {
    await expect(
      navigation.getByRole("link", { name, exact: true }),
    ).toHaveAttribute("href", href);
  }
  await expect(navigation.getByRole("link", { name: "Projects" })).toHaveCount(
    0,
  );
  await expect(navigation.getByRole("link", { name: "Papers" })).toHaveCount(0);
  await expect(
    navigation.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("uses softened twilight colors instead of white on black", async ({
  page,
}) => {
  await page.goto("/");

  const colors = await page.locator("body").evaluate((body) => {
    const style = getComputedStyle(body);
    return { color: style.color, background: style.backgroundColor };
  });
  expect(colors.color).not.toBe("rgb(255, 255, 255)");
  expect(colors.background).not.toBe("rgb(0, 0, 0)");
});

test("homepage presents identity, three research rows, and latest outputs", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Ryan Yu" }),
  ).toHaveCount(1);
  await expect(
    page.getByText("California Institute of Technology", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Current research" }).getByRole("listitem"),
  ).toHaveCount(3);
  await expect(
    page.getByRole("heading", {
      name: "Latest publications & presentations",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Research interests" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Selected projects" }),
  ).toHaveCount(0);
  await expect(
    page
      .locator(".hero-actions")
      .getByRole("link", { name: "Ryan Yu on LinkedIn" }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/ryan-yu-0bb27a23b");
  await expect(page.locator(".hero-orbit[aria-hidden='true']")).toHaveCount(1);
  await expect(
    page.getByText(
      "The Mechanism for Ligand Activation of the Smoothened G Protein-Coupled Receptor",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator(".publication-list")).toHaveAttribute(
    "role",
    "list",
  );
});

test("research page renders three editable appointments without workflow scaffolding", async ({
  page,
}) => {
  await page.goto("/research");

  await expect(page.locator(".research-entry")).toHaveCount(3);
  for (const lab of ["Rotskoff Lab", "Fong Lab", "Goddard Lab"]) {
    await expect(page.getByText(lab, { exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole("list", { name: "Research workflow" }),
  ).toHaveCount(0);
});

test("projects index links to public case studies with research-document sections", async ({
  page,
}) => {
  await page.goto("/projects");

  const projectLinks = page.locator('main a[href^="/projects/"]');
  await expect(projectLinks.first()).toBeVisible();
  await projectLinks.first().click();

  await expect(
    page.getByRole("heading", { name: "Scientific question" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Approach" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Validation and results" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Reproducibility" }),
  ).toBeVisible();
  await expect(page.getByText(/\bdraft\b/i)).toHaveCount(0);
});

test("each public project route renders required headings and dates", async ({
  page,
}) => {
  for (const [path, datetime, label] of [
    ["/projects/rotskoff-protein-representations", "2026-06", "June 2026"],
    ["/projects/nitrate-reduction-electrolytes", "2024-12", "December 2024"],
    ["/projects/smoothened-gi", "2023-12", "December 2023"],
  ]) {
    await page.goto(path);
    for (const heading of [
      "Scientific question",
      "Approach",
      "Validation and results",
      "Reproducibility",
      "Project record",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(page.locator(`time[datetime='${datetime}']`)).toHaveText(
      label,
    );
    await expect(page.locator("time[datetime='2024-01-01']")).toHaveCount(0);
  }
});

test("papers page preserves publication authors, status, and date precision", async ({
  page,
}) => {
  await page.goto("/papers");

  await expect(
    page.getByRole("heading", { level: 1, name: "Papers" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "2026" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "The Mechanism for Ligand Activation of the Smoothened G Protein-Coupled Receptor",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("Published", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Ryan D. Yu, Amy-Doan P. Vo, Soo-Kyung Kim, William A. Goddard III",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /DOI/i })).toHaveAttribute(
    "href",
    "https://doi.org/10.1073/pnas.2604658123",
  );
  await expect(page.locator("time[datetime='2026']")).toHaveText("2026");
  await expect(page.locator("time[datetime='2025-01-01']")).toHaveCount(0);
  await expect(page.getByText(/\bdraft\b/i)).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveCount(0);
  const publicationTypes = page.locator("[data-publication-type]");
  await expect(publicationTypes).toHaveCount(1);
  await expect(publicationTypes.first()).toHaveAttribute(
    "data-publication-type",
    "journal",
  );
});

test("about page renders only the manually authored article", async ({
  page,
}) => {
  await page.goto("/about");

  await expect(
    page.getByRole("article", { name: "About Ryan Yu" }),
  ).toBeVisible();
  await expect(
    page.getByText("Research appointments", { exact: true }),
  ).toHaveCount(0);
});

test("about Person JSON-LD uses Astro's configured canonical site", async ({
  page,
}) => {
  await page.goto("/about");

  const personJsonLd = page.locator('script[type="application/ld+json"]');
  await expect(personJsonLd).toHaveCount(1);
  expect(
    JSON.parse(await personJsonLd.evaluate((script) => script.innerHTML)),
  ).toMatchObject({ url: "http://127.0.0.1:4321/" });
});

test("CV route uses the branded not-found page without private contact data", async ({
  page,
}) => {
  const response = await page.goto("/cv");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(
    /\b\d{3}[-.)\s]\d{3}[-.]\d{4}\b/,
  );
});

test("missing routes render a branded, base-safe not-found page", async ({
  page,
}) => {
  await page.goto("/missing-page");

  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  for (const [name, href] of [
    ["Home", "/"],
    ["Research", "/research"],
    ["Projects", "/projects"],
    ["Papers", "/papers"],
  ]) {
    await expect(
      page.getByRole("main").getByRole("link", { name, exact: true }),
    ).toHaveAttribute("href", href);
  }
});
