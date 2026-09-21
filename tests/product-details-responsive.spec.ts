import { expect, test } from "@playwright/test";
import { productDetailCandidates } from "../lib/content/product-detail-candidates.mjs";

const widths = [1440, 1024, 768, 430, 390, 320];

for (const candidate of productDetailCandidates) {
  test(`${candidate.gradeCode} remains usable across all required widths`, async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(candidate.path);
      expect(response?.status(), `${candidate.gradeCode} at ${width}px`).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("main table")).toBeVisible();
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator("main h2")).not.toHaveCount(0);
      await expect(page.locator("table thead th")).not.toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
        `${candidate.gradeCode} has page-level overflow at ${width}px`,
      ).toBe(true);
      expect(errors).toEqual([]);
    }
  });

  test(`${candidate.gradeCode} shares accessible navigation and overlay behavior`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(candidate.path);
    await expect(page.getByRole("navigation", { name: "Breadcrumb", exact: true })).toBeVisible();
    const menuTrigger = page.getByRole("button", { name: "Open primary navigation", exact: true });
    await expect
      .poll(() => menuTrigger.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$"))))
      .toBe(true);
    await menuTrigger.click();
    const menu = page.getByRole("dialog", { name: "Primary navigation menu" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("button", { name: "Close primary navigation menu" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menuTrigger).toBeFocused();
    const cookieTrigger = page.getByRole("button", { name: "Cookie Settings", exact: true });
    await cookieTrigger.click();
    const cookieDialog = page.getByRole("dialog", { name: "Cookie settings", exact: true });
    await expect(cookieDialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(cookieTrigger).toBeFocused();
  });
}

test("the 13 preview routes remain sitemap-excluded", async ({ request }) => {
  expect((await request.get("/sitemap.xml")).status()).toBe(404);
});
