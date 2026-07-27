import { expect, test } from "@playwright/test";

test("homepage exposes research navigation", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Research", "Projects", "Papers", "CV"]) {
    await expect(page.getByRole("link", { name })).toBeVisible();
  }
});
