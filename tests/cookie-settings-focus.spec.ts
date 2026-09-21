import { expect, test, type Page } from "@playwright/test";

const sharedChromeRoutes = [
  "/products/cr-901/",
  "/",
  "/products/",
  "/products/m-350/",
  "/applications/",
];

async function openCookieSettings(page: Page) {
  const trigger = page.getByRole("button", {
    name: "Cookie Settings",
    exact: true,
  });
  await trigger.click();

  const dialog = page.getByRole("dialog", {
    name: "Cookie settings",
    exact: true,
  });
  await expect(dialog).toBeVisible();

  return { dialog, trigger };
}

for (const route of sharedChromeRoutes) {
  test(`${route} traps Cookie Settings focus in both directions`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);

    const { dialog, trigger } = await openCookieSettings(page);
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    const policy = dialog.getByRole("link", {
      name: "Read Cookie Policy",
      exact: true,
    });

    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(policy).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(policy).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(close).toBeFocused();
    await expect(dialog).toContainText("Optional Analytics is not active");
    await expect(dialog).toContainText(
      "Necessary only; Analytics unavailable",
    );

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
}

test("Cookie Settings close button and backdrop restore the trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/cr-901/");

  let controls = await openCookieSettings(page);
  await controls.dialog
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(controls.dialog).not.toBeVisible();
  await expect(controls.trigger).toBeFocused();

  controls = await openCookieSettings(page);
  await controls.dialog.click({ position: { x: 8, y: 8 } });
  await expect(controls.dialog).not.toBeVisible();
  await expect(controls.trigger).toBeFocused();
});
