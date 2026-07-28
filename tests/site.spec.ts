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

  test("research workflow remains visible with reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/research");
    await expect(
      page.getByRole("list", { name: "Research workflow" }),
    ).toBeVisible();
    await expect(
      page.getByText("Physical insight", { exact: true }),
    ).toBeVisible();
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

test("primary navigation identifies home as the current page", async ({
  page,
}) => {
  await page.goto("/");

  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  for (const [name, href] of [
    ["Home", "/"],
    ["Research", "/research"],
    ["Projects", "/projects"],
    ["Papers", "/papers"],
    ["About", "/about"],
    ["CV", "/cv"],
  ]) {
    await expect(
      navigation.getByRole("link", { name, exact: true }),
    ).toHaveAttribute("href", href);
  }
  await expect(
    navigation.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("homepage presents the public research overview with one primary heading", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Research interests" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Chemical Engineering (Computational) undergraduate at Caltech",
      { exact: false },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explore the research process" }),
  ).toHaveAttribute("href", "/research");
  await expect(page.getByText(/\bdraft\b/i)).toHaveCount(0);
  await expect(
    page.getByRole("article").filter({
      hasText: "Machine-learned potentials for nitrate-reduction electrolytes",
    }),
  ).toContainText("2024");
  await expect(
    page.getByRole("article").filter({
      hasText: "Machine-learned potentials for nitrate-reduction electrolytes",
    }),
  ).not.toContainText("January");
  await expect(
    page.getByText(
      "The Mechanism for Ligand Activation of the Smoothened G Protein-Coupled Receptor",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("Submitted", { exact: true })).toBeVisible();
  await expect(page.locator(".publication-list")).toHaveAttribute(
    "role",
    "list",
  );
});

test("research page explains the ordered data-to-insight workflow", async ({
  page,
}) => {
  await page.goto("/research");

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const flow = page.getByRole("list", { name: "Research workflow" });
  const stages = flow.getByRole("listitem");

  await expect(stages).toHaveCount(4);
  for (const [index, stage] of [
    "First-principles data",
    "Learned potentials",
    "Molecular simulation",
    "Physical insight",
  ].entries()) {
    await expect(stages.nth(index)).toContainText(stage);
  }
  await expect(
    page.getByText("molecule-similarity testing and model validation", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(flow).toHaveAttribute("role", "list");
  await expect(page.getByText(/\bdraft\b/i)).toHaveCount(0);
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

test("each public project route renders required headings and year-only dates", async ({
  page,
}) => {
  for (const [path, year] of [
    ["/projects/nitrate-reduction-electrolytes", "2024"],
    ["/projects/smoothened-gi", "2023"],
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
    await expect(page.locator(`time[datetime='${year}']`)).toBeVisible();
    await expect(page.locator("time[datetime='2024-01-01']")).toHaveCount(0);
  }
});

test("papers page preserves publication authors, status, and year-only date precision", async ({
  page,
}) => {
  await page.goto("/papers");

  await expect(
    page.getByRole("heading", { level: 1, name: "Papers" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "2025" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "The Mechanism for Ligand Activation of the Smoothened G Protein-Coupled Receptor",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("Submitted", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Ryan Yu, Amy-Doan Vo, Soo-Kyung Kim, William Goddard III", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("time[datetime='2025']")).toHaveText("2025");
  await expect(page.locator("time[datetime='2025-01-01']")).toHaveCount(0);
  await expect(page.getByText(/\bdraft\b/i)).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveCount(0);
  const publicationTypes = page.locator("[data-publication-type]");
  await expect(publicationTypes).toHaveCount(1);
  await expect(publicationTypes.first()).toHaveAttribute(
    "data-publication-type",
    "manuscript",
  );
});

test("about page presents the approved research trajectory without vanity content", async ({
  page,
}) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", { level: 1, name: "About Ryan Yu" }),
  ).toBeVisible();
  await expect(page.getByText("2023 to 2027", { exact: false })).toBeVisible();
  await expect(
    page.getByRole("main").getByText("Goddard Lab", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByText("Fong Lab", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/skill cloud|publications count|citation count/i),
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

test("CV is a contactable HTML summary without a PDF or phone number", async ({
  page,
}) => {
  await page.goto("/cv");

  await expect(
    page.getByRole("heading", { level: 1, name: "Curriculum vitae" }),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "Email Ryan Yu" }),
  ).toHaveAttribute("href", "mailto:rdyu@caltech.edu");
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
