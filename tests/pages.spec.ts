import { test, expect } from "@playwright/test";
test("M350 deep link and collection navigation", async ({ page }) => {
  const response = await page.goto("/products/m-350/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText(
    "M-350 Titanium Dioxide for Multi-Application Evaluation",
  );
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(15);
  await expect(page.locator("tbody tr").first()).toHaveText(
    "TiO₂ content, %≥ 92.593.5",
  );
  await expect(page.locator("body")).toContainText(
    "Additional Paper Evaluation Path",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://tio2products.com/products/m-350/",
  );
  await expect(page.locator('main a[href^="/request-"]')).toHaveCount(0);
  await page.locator('a[href="/products/"]').first().click();
  await expect(page).toHaveURL(/\/products\/$/);
  await page.locator('a[href="/products/m-350/"]').first().click();
  await expect(page.locator("h1")).toContainText("M-350");
});
test("home renders independently of WordPress", async ({ page }) => {
  await page.route(/wp-json|graphql|\/api\//, (route) => route.abort());
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText(
    "Malaysia Titanium Dioxide for Industrial Buyers",
  );
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator('a[href="/products/"]').first()).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("products filters and exposes all validated detail links", async ({ page }) => {
  const response = await page.goto("/products/");
  expect(response?.status()).toBe(200);
  const choices = page.getByRole("group").getByRole("button");
  await expect(choices.first()).toHaveAttribute("aria-pressed", "true");
  await choices.nth(1).click();
  await expect(choices.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(choices.first()).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator('[aria-live="polite"] strong')).toHaveText([
    "M-350",
    "M-510",
    "M-200",
    "M-108",
    "M-210",
    "M-340",
    "M-886",
    "M-2377",
  ]);
  await choices.getByText("Not Sure", { exact: true }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText(
    "No grade is listed for this application.",
  );
  const hrefs = await page
    .locator('a[href^="/products/"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  expect([...new Set(hrefs.filter(Boolean))].sort()).toEqual(
    [
      "/products/",
      "/products/cr-901/",
      "/products/m-108/",
      "/products/m-200/",
      "/products/m-210/",
      "/products/m-2196/",
      "/products/m-2377/",
      "/products/m-340/",
      "/products/m-350/",
      "/products/m-510/",
      "/products/m-52/",
      "/products/m-886/",
      "/products/m-895/",
      "/products/m-896/",
      "/products/m-996/",
    ].sort(),
  );
  const faq = page
    .locator('button[aria-controls^="product-faq-answer-"]')
    .nth(1);
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
  const answerId = await faq.getAttribute("aria-controls");
  await expect(page.locator(`[id="${answerId}"]`)).toBeVisible();
});

test("structured data keeps only available grade URLs", async ({ page }) => {
  await page.goto("/");
  const home = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  expect(
    home["@graph"].map((node: { "@type": string }) => node["@type"]),
  ).toEqual(["WebSite", "WebPage", "Organization", "Brand", "Product"]);
  await page.goto("/products/");
  const schema = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  const items = schema["@graph"].find(
    (node: { "@type": string }) => node["@type"] === "ItemList",
  ).itemListElement;
  expect(items).toHaveLength(14);
  expect(
    items
      .filter((entry: { item: { url?: string } }) => entry.item.url)
      .map((entry: { item: { url: string } }) => entry.item.url),
  ).toEqual([
    "https://tio2products.com/products/m-350/",
    "https://tio2products.com/products/m-510/",
    "https://tio2products.com/products/m-896/",
    "https://tio2products.com/products/m-996/",
    "https://tio2products.com/products/m-2196/",
    "https://tio2products.com/products/m-895/",
    "https://tio2products.com/products/m-200/",
    "https://tio2products.com/products/m-108/",
    "https://tio2products.com/products/m-210/",
    "https://tio2products.com/products/m-340/",
    "https://tio2products.com/products/m-886/",
    "https://tio2products.com/products/m-52/",
    "https://tio2products.com/products/m-2377/",
    "https://tio2products.com/products/cr-901/",
  ]);
  await page.goto("/products/m-350/");
  const detail = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  const product = detail["@graph"].find(
    (node: { "@type": string }) => node["@type"] === "Product",
  );
  expect(product.additionalProperty).toHaveLength(15);
  expect(product.additionalProperty[0]).toEqual({
    "@type": "PropertyValue",
    name: "TiO₂ content, %",
    value: "Standard: ≥ 92.5; Typical Value: 93.5",
  });
  for (const key of [
    "offers",
    "aggregateRating",
    "manufacturer",
    "countryOfOrigin",
  ])
    expect(product).not.toHaveProperty(key);
});
