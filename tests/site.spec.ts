import { expect, test } from "@playwright/test";

test("homepage navigation links activate matching section targets", async ({
  page,
}) => {
  await page.goto("/");
  for (const [name, target] of [
    ["Research", "research"],
    ["Projects", "projects"],
    ["Papers", "papers"],
    ["CV", "cv"],
  ]) {
    const link = page.getByRole("link", { name });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", `#${target}`);
    await expect(page.locator(`#${target}`)).toHaveCount(1);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${target}$`));
  }
});
