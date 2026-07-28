import { expect, test } from "@playwright/test";

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

test("each public project route renders its canonical body sentence", async ({
  page,
}) => {
  for (const [path, sentence] of [
    [
      "/projects/nitrate-reduction-electrolytes",
      "I am also developing a potential for the TiH2/electrolyte interface",
    ],
    [
      "/projects/smoothened-gi",
      "This work identified a precoupled inactive Smoothened–closed Gi state",
    ],
  ]) {
    await page.goto(path);
    await expect(page.getByText(sentence, { exact: false })).toBeVisible();
  }
});
