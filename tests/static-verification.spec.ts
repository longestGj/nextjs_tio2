import { test, expect } from "@playwright/test";
import path from "node:path";

test("current D32 collection surfaces and shared footer copy", async ({
  page,
}) => {
  await page.goto("/products/");
  await expect(page.locator("footer")).toContainText(
    "Titanium dioxide product, market and procurement information for international industrial buyers.",
  );
  await expect(page.locator('[data-module="grade-selector"]')).toHaveCSS(
    "background-color",
    "rgb(245, 248, 251)",
  );
  await expect(page.locator('[data-module="final-rfq"]')).toHaveCSS(
    "background-color",
    "rgb(245, 248, 251)",
  );
});

const routes = ["/", "/products/", "/products/m-350/"];
test("M350 breadcrumb items share one vertical center", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/products/m-350/");
  const centers = await page
    .getByRole("navigation", { name: "Breadcrumb", exact: true })
    .locator("li")
    .evaluateAll((items) =>
      items.map((item) => {
        const node = document
          .createTreeWalker(item, NodeFilter.SHOW_TEXT)
          .nextNode()!;
        const range = document.createRange();
        range.selectNodeContents(node);
        const r = range.getBoundingClientRect();
        return r.top + r.height / 2;
      }),
    );
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(2);
});
test("selector waits for hydration before accepting clicks", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/_next/**/*.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/products/", { waitUntil: "commit" });
    const plastics = page
      .getByRole("group")
      .getByRole("button", { name: "Plastics", exact: true });
    await expect(plastics).toBeVisible();
    await expect(plastics).toBeDisabled();
    release();
    await expect(plastics).toBeEnabled();
    await plastics.click();
    await expect(plastics).toHaveAttribute("aria-pressed", "true");
  } finally {
    release();
  }
});
const widths = [320, 390, 768, 1024, 1280, 1440];
for (const route of routes) {
  for (const width of widths) {
    test(`${route} static layout ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("response", (response) => {
        if (response.status() >= 400) errors.push(response.url());
      });
      page.on("request", (request) => {
        if (/wp-json|graphql|\/api\//.test(request.url()))
          errors.push(request.url());
      });
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      for (const img of await page.locator("img").all()) {
        if (await img.isVisible()) {
          await img.scrollIntoViewIfNeeded();
          await expect
            .poll(() =>
              img.evaluate(
                (image: HTMLImageElement) =>
                  image.complete && image.naturalWidth > 0,
              ),
            )
            .toBe(true);
        }
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://tio2products.com" + route,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
      expect(errors).toEqual([]);
      await page.evaluate(() => scrollTo(0, 0));
      if (width === 390 || width === 1440) {
        const name =
          route === "/" ? "home" : route === "/products/" ? "products" : "m350";
        await page.screenshot({
          path: path.resolve(
            process.env.STATIC_EVIDENCE_DIR || "test-results/screenshots",
            `${name}-${width}-viewport.png`,
          ),
        });
        await page.screenshot({
          path: path.resolve(
            process.env.STATIC_EVIDENCE_DIR || "test-results/screenshots",
            `${name}-${width}.png`,
          ),
          fullPage: true,
        });
      }
    });
  }
  test(`${route} menu and cookie keyboard behavior`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    const trigger = page.getByRole("button", {
      name: "Open primary navigation",
      exact: true,
    });
    await trigger.click();
    const menu = page.getByRole("dialog", { name: "Primary navigation menu" });
    await expect(menu).toBeVisible();
    await expect(
      menu.getByRole("button", { name: "Close primary navigation menu" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
    await expect(trigger).toBeFocused();
    const cookie = page.getByRole("button", {
      name: "Cookie Settings",
      exact: true,
    });
    await cookie.click();
    const dialog = page.getByRole("dialog", {
      name: "Cookie settings",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Close", exact: true }),
    ).toBeFocused();
    await expect(dialog).toContainText("Optional Analytics is not active");
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(cookie).toBeFocused();
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    await page.reload();
    await cookie.click();
    await expect(dialog).toContainText("Necessary only; Analytics unavailable");
  });
  test(`${route} no internal identifiers or unready grade URLs in public HTML`, async ({
    request,
  }) => {
    const response = await request.get(route);
    const html = await response.text();
    expect(
      html.match(
        /GRADE-M350|PRODUCT-000|HOME-001|GLOBAL-CHROME|D:\\|D:\/|tio2malaysia\.com/g,
      ),
    ).toBeNull();
    expect(html.match(/\/products\/(?:m-510|cr-901)\//g)).toBeNull();
  });
}

test("all seven product selections return the approved grade relationships", async ({
  page,
}) => {
  await page.goto("/products/");
  const cases: Record<string, string[]> = {
    Coatings: [
      "M-350",
      "M-510",
      "M-896",
      "M-996",
      "M-2196",
      "M-895",
      "M-52",
      "M-2377",
    ],
    Plastics: [
      "M-350",
      "M-510",
      "M-200",
      "M-108",
      "M-210",
      "M-340",
      "M-886",
      "M-2377",
    ],
    Masterbatch: [
      "M-510",
      "M-200",
      "M-108",
      "M-210",
      "M-340",
      "M-886",
      "M-2377",
    ],
    "Printing Inks": ["M-350", "M-510", "M-52", "M-2377"],
    Paper: ["M-350", "M-2377"],
    "Specialty Materials": ["CR-901"],
    "Not Sure": [],
  };
  for (const [label, grades] of Object.entries(cases)) {
    await page
      .getByRole("group")
      .getByRole("button", { name: label, exact: true })
      .click();
    await expect(page.locator('[aria-live="polite"] strong')).toHaveText(
      grades,
    );
  }
  await expect(
    page.locator('section[aria-labelledby="directory-heading"] strong'),
  ).toHaveText([
    "M-350",
    "M-510",
    "M-896",
    "M-996",
    "M-2196",
    "M-895",
    "M-200",
    "M-108",
    "M-210",
    "M-340",
    "M-886",
    "M-52",
    "M-2377",
    "CR-901",
  ]);
});

test("approved fonts are bundled locally", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      Array.from(document.fonts).some(
        (font) => font.family === "Inter" && font.status === "loaded",
      ),
    ),
  ).toBe(true);
});

test("all fifteen technical rows reproduce approved data", async ({ page }) => {
  await page.goto("/products/m-350/");
  const rows = await page
    .locator("tbody tr")
    .evaluateAll((rows) =>
      rows.map((row) =>
        Array.from(row.querySelectorAll("th,td"), (cell) => cell.textContent),
      ),
    );
  expect(rows).toEqual([
    ["TiO₂ content, %", "≥ 92.5", "93.5"],
    ["Content of rutile, %", "≥ 99.0", "100"],
    ["Brightness, %", "≥ 95.1", "95.4"],
    ["L (dry powder)", "—", "98.3"],
    ["b (dry powder)", "—", "1.85"],
    ["Reducing power (Reynolds number)", "1920", "1950"],
    ["Dispersibility (Hegman)", "≥ 6.50", "6.75"],
    ["Oil absorption, g/100g", "≤ 20", "18"],
    ["Slurry pH", "6.5–8.5", "7.2"],
    ["Electric resistivity, Ω·m", "80", "165"],
    ["Volatile at 105°C, %", "≤ 0.5", "0.4"],
    ["Sieve residue (45 µm), %", "≤ 0.02", "0.01"],
    ["Average particle size (nm) SEM", "—", "230"],
    ["Inorganic treatment", "ZrO₂, Al₂O₃", "—"],
    ["Organic treatment", "Yes", "—"],
  ]);
});

test("mobile grade directory remains readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:8333/");
    const grades = page.locator("[data-product-grade-id]");
    await expect(grades).toHaveCount(14);
    for (const grade of await grades.all()) await expect(grade).toBeVisible();
    const descriptions = page.locator("[data-product-group] article p");
    await expect(descriptions).toHaveCount(4);
    for (const description of await descriptions.all())
      await expect(description).toBeVisible();
  } finally {
    await context.close();
  }
});

test("mobile grade disclosure works after hydration", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const group = page.locator("[data-product-group]").first();
  const button = group.locator("button");
  await expect(button).toBeEnabled();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(group.locator("article")).toBeHidden();
  await button.click();
  await expect(group.locator("article")).toBeVisible();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await button.click();
  await expect(group.locator("article")).toBeHidden();
});

test("static copy remains available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const route of routes) {
    expect((await page.goto("http://127.0.0.1:8333" + route))?.status()).toBe(
      200,
    );
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).toContainText("titanium dioxide");
  }
  await context.close();
});
