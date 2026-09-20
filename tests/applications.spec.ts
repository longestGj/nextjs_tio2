import { expect, test } from "@playwright/test";

const approvedCollections = [
  ["Coatings", ["M-350", "M-510", "M-896", "M-996", "M-2196", "M-895", "M-52", "M-2377"]],
  ["Plastics", ["M-350", "M-510", "M-200", "M-108", "M-210", "M-340", "M-886", "M-2377"]],
  ["Masterbatch", ["M-510", "M-200", "M-108", "M-210", "M-340", "M-886", "M-2377"]],
  ["Printing Inks", ["M-350", "M-510", "M-52", "M-2377"]],
  ["Paper", ["M-350", "M-2377"]],
  ["Specialty Materials", ["CR-901"]],
] as const;

test("Applications renders the approved static route and metadata", async ({ page }) => {
  const response = await page.goto("/applications/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Explore Titanium Dioxide by Application");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://tio2products.com/applications/",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Explore titanium dioxide application paths for coatings, plastics, masterbatch, printing inks, paper and specialty materials.",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('nav[aria-label="Primary navigation"] a[aria-current="page"]')).toHaveText("Applications");
  expect(
    await page
      .locator("main [data-module]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-module"))),
  ).toEqual([
    "M1-HERO",
    "M2-APPLICATION_PATHS",
    "M3-EVALUATION_GUIDE",
    "M4-PROCUREMENT_PATHS",
  ]);
});

test("Applications exposes only currently implemented destinations", async ({ page }) => {
  await page.goto("/applications/");
  const cards = page.locator("[data-application-card]");
  await expect(cards).toHaveCount(6);
  for (const [index, [title, grades]] of approvedCollections.entries()) {
    const card = cards.nth(index);
    await expect(card.locator("h3")).toHaveText(title);
    await expect(card.locator("[data-grade]")).toHaveText(grades);
  }
  await expect(page.locator("[data-grade]")).toHaveCount(30);
  await expect(page.locator('[data-grade] a[href="/products/m-350/"]')).toHaveCount(4);
  await expect(page.locator("[data-grade] a")).toHaveCount(4);
  await expect(page.locator("[data-grade] span")).toHaveCount(26);
  await expect(page.locator("[data-application-action]")).toHaveCount(0);
  await expect(page.locator("[data-route-sentence]")).toHaveText(
    "Open a grade page for product information.",
  );
  await expect(page.locator("[data-evaluation-step] h3")).toHaveText([
    "Choose your application.",
    "Compare technical information.",
    "Validate in your own system.",
  ]);
  await expect(page.locator("[data-procurement-card] h3")).toHaveText(["Products"]);
  await expect(page.locator('[data-procurement-card] a[href="/products/"]')).toHaveCount(1);
  await expect(page.locator('[data-module="M5-FINAL-RFQ"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/request-a-quote/"]')).toHaveCount(0);
  await expect(page.locator('[data-module*="PROCESS"], [data-module*="FAQ"]')).toHaveCount(0);
});

test("Applications Schema and Products support match visible readiness", async ({ page, request }) => {
  await page.goto("/applications/");
  const schema = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  expect(schema["@graph"].map((node: { "@type": string }) => node["@type"])).toEqual([
    "CollectionPage",
    "BreadcrumbList",
  ]);
  expect(schema["@graph"].some((node: { "@type": string }) => node["@type"] === "ItemList")).toBe(false);

  const html = await (await request.get("/applications/")).text();
  expect(
    html.match(/APP-(?:000|COAT|PLAS|MB|INK|PAPER)|GRADE-[A-Z0-9-]+|PRODUCT-000|DOC-000|MARKET-000|CONV-RFQ/g),
  ).toBeNull();

  await page.goto("/products/");
  const support = page.locator('[data-module="support"]');
  await expect(support).toBeVisible();
  await expect(support.locator("h3")).toHaveText(["Review by Application"]);
  await expect(support.locator('a[href="/applications/"]')).toHaveCount(1);
});
