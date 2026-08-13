import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const auditedPaths = ["/", "/missing-page"];

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

  test("research entries remain visible with reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const researchEntries = page.locator(".research-entry");
    await expect(researchEntries).toHaveCount(3);
    for (let index = 0; index < (await researchEntries.count()); index += 1) {
      await expect(researchEntries.nth(index)).toBeVisible();
    }
  });
});

test("shared shell exposes page landmarks without a navigation chrome", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/favicon.svg",
  );
});

test("shared SEO exposes the light theme and social preview", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#fbfcfd",
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

test("uses a softened light ground rather than pure black on white", async ({
  page,
}) => {
  await page.goto("/");

  const colors = await page.locator("body").evaluate((body) => {
    const style = getComputedStyle(body);
    return { color: style.color, background: style.backgroundColor };
  });
  expect(colors.color).not.toBe("rgb(0, 0, 0)");
  expect(colors.color).not.toBe("rgb(255, 255, 255)");
  expect(colors.background).not.toBe("rgb(255, 255, 255)");
  expect(colors.background).not.toBe("rgb(0, 0, 0)");
});

test("accent text meets the AA contrast floor against the page ground", async ({
  page,
}) => {
  await page.goto("/");

  const contrast = await page
    .getByRole("heading", { level: 2, name: "Research" })
    .evaluate((heading) => {
      // Chromium serializes oklch() colors verbatim, so rasterize each color
      // through a canvas to recover its actual sRGB bytes.
      const context = document.createElement("canvas").getContext("2d");
      if (!context) throw new Error("Expected a 2D canvas context.");
      const toRgb = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };
      const channel = (value: number) => {
        const srgb = value / 255;
        return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (rgb: number[]) =>
        0.2126 * channel(rgb[0]) +
        0.7152 * channel(rgb[1]) +
        0.0722 * channel(rgb[2]);

      const ink = luminance(toRgb(getComputedStyle(heading).color));
      const ground = luminance(
        toRgb(getComputedStyle(document.body).backgroundColor),
      );
      const [light, dark] = ink > ground ? [ink, ground] : [ground, ink];
      return (light + 0.05) / (dark + 0.05);
    });

  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test("the single page presents identity, about, research, and publications", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Ryan Yu" }),
  ).toHaveCount(1);
  await expect(page.locator(".identity__role")).toContainText(
    "California Institute of Technology",
  );

  for (const section of ["About", "Research", "Publications & Presentations"]) {
    await expect(
      page.getByRole("heading", { level: 2, name: section }),
    ).toBeVisible();
  }

  await expect(page.getByRole("list", { name: "Research" })).toBeVisible();
  await expect(page.locator(".research-entry")).toHaveCount(3);
  const affiliations = page.locator(".research-entry__affiliation");
  await expect(affiliations).toHaveCount(3);
  for (const lab of ["Rotskoff Lab", "Fong Lab", "Goddard Lab"]) {
    await expect(affiliations.filter({ hasText: lab })).toHaveCount(1);
  }

  await expect(
    page.getByText(
      "The Mechanism for Ligand Activation of the Smoothened G Protein-Coupled Receptor",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Ryan D. Yu, Amy-Doan P. Vo, Soo-Kyung Kim, William A. Goddard III",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator("time[datetime='2026']")).toHaveText("2026");
  await expect(page.getByText(/\bdraft\b/i)).toHaveCount(0);
});

test("research methods render as plain text rather than chips", async ({
  page,
}) => {
  await page.goto("/");

  // Assert the rendering contract — middot-joined prose, not list chips —
  // rather than the method names themselves, which change with the work.
  const methods = page.locator(".research-entry__methods").first();
  await expect(methods).toHaveText(/^[^·]+( · [^·]+)+$/);
  await expect(methods.locator("li")).toHaveCount(0);
});

test("external scholarship links resolve to their sources", async ({
  page,
}) => {
  await page.goto("/");

  const doiLinks = page.getByRole("link", { name: "DOI", exact: true });
  await expect(doiLinks).toHaveCount(2);
  for (let index = 0; index < (await doiLinks.count()); index += 1) {
    await expect(doiLinks.nth(index)).toHaveAttribute(
      "href",
      "https://doi.org/10.1073/pnas.2604658123",
    );
  }
  await expect(
    page.getByRole("link", { name: "Ryan Yu on LinkedIn", exact: true }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/ryan-yu-0bb27a23b");
  await expect(
    page.getByRole("link", { name: "Email Ryan Yu", exact: true }),
  ).toHaveAttribute("href", "mailto:rdyu@caltech.edu");
  await expect(
    page.getByRole("link", { name: "Ryan Yu on GitHub", exact: true }),
  ).toHaveAttribute("href", "https://github.com/rdyu-cm");
});

test("structured data covers the person and the published article", async ({
  page,
}) => {
  await page.goto("/");

  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  const parsed = JSON.parse(
    await jsonLd.evaluate((script) => script.innerHTML),
  );

  expect(parsed).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "@type": "Person",
        url: "http://127.0.0.1:4321/",
      }),
      expect.objectContaining({
        "@type": "ScholarlyArticle",
        datePublished: "2026",
      }),
    ]),
  );
});

test("retired routes render the branded not-found page", async ({ page }) => {
  for (const path of [
    "/research",
    "/publications",
    "/about",
    "/cv",
    "/papers",
    "/projects",
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  }
});

test("the not-found page offers a single base-safe way home", async ({
  page,
}) => {
  await page.goto("/missing-page");

  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "Back to home" }),
  ).toHaveAttribute("href", "/");
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(
    /\b\d{3}[-.)\s]\d{3}[-.]\d{4}\b/,
  );
});
