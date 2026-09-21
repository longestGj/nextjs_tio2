import { test, expect } from "@playwright/test";

const thankYouReceiptKey = "tio2-my:thank-you:receipt:v1";

test("thank-you does not trust the URL alone", async ({ page }) => {
  await page.goto("/thank-you/?request=quote");
  await expect(page.locator("h1")).toHaveText("How can we help?");
  await expect(page.getByText("REQUEST RECEIVED")).toHaveCount(0);
});

test("thank-you accepts one matching fresh receipt", async ({ page }) => {
  await page.addInitScript(({ key }) => {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        request: "quote",
        succeededAt: Date.now(),
        flowId: "test-flow",
      }),
    );
  }, { key: thankYouReceiptKey });
  await page.goto("/thank-you/?request=quote");
  await expect(page.locator("h1")).toHaveText(
    "Thank you. We’ve received your quotation request.",
  );
  await expect(page.getByText("REQUEST RECEIVED")).toBeVisible();
});

for (const invalid of [
  {
    name: "duplicate request parameters",
    search: "?request=quote&request=quote",
    receipt: {
      version: 1,
      request: "quote",
      succeededAt: "now",
      flowId: "test-flow",
    },
  },
  {
    name: "expired receipt",
    search: "?request=quote",
    receipt: {
      version: 1,
      request: "quote",
      succeededAt: "expired",
      flowId: "test-flow",
    },
  },
  {
    name: "future receipt",
    search: "?request=quote",
    receipt: {
      version: 1,
      request: "quote",
      succeededAt: "future",
      flowId: "test-flow",
    },
  },
  {
    name: "mismatched request",
    search: "?request=quote",
    receipt: {
      version: 1,
      request: "documents",
      succeededAt: "now",
      flowId: "test-flow",
    },
  },
  {
    name: "missing flow id",
    search: "?request=quote",
    receipt: { version: 1, request: "quote", succeededAt: "now" },
  },
] as const) {
  test(`thank-you rejects ${invalid.name}`, async ({ page }) => {
    await page.addInitScript(
      ({ key, receipt }) => {
        const now = Date.now();
        const succeededAt =
          receipt.succeededAt === "expired"
            ? now - 600_001
            : receipt.succeededAt === "future"
              ? now + 600_001
              : now;
        sessionStorage.setItem(
          key,
          JSON.stringify({ ...receipt, succeededAt }),
        );
      },
      { key: thankYouReceiptKey, receipt: invalid.receipt },
    );
    await page.goto(`/thank-you/${invalid.search}`);
    await expect(page.locator("h1")).toHaveText("How can we help?");
    await expect(page.getByText("REQUEST RECEIVED")).toHaveCount(0);
  });
}

test("thank-you rejects corrupt receipt JSON", async ({ page }) => {
  await page.addInitScript(({ key }) => {
    sessionStorage.setItem(key, "not-json");
  }, { key: thankYouReceiptKey });
  await page.goto("/thank-you/?request=quote");
  await expect(page.locator("h1")).toHaveText("How can we help?");
});

test("thank-you falls back when storage cannot be read", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("storage unavailable");
    };
  });
  await page.goto("/thank-you/?request=quote");
  await expect(page.locator("h1")).toHaveText("How can we help?");
});

test("privacy policy preserves the approved legal contract", async ({
  page,
}) => {
  const response = await page.goto("/privacy-policy/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Privacy Policy");
  await expect(
    page.getByText("Last updated: 5 September 2026"),
  ).toBeVisible();
  await expect(page.locator("main article h2")).toHaveText([
    "Who We Are",
    "Information We Collect",
    "How We Use Information",
    "Service Providers and International Processing",
    "How Long We Keep Information",
    "Cookies and Analytics",
    "Your Rights and Choices",
    "Security and Data Minimisation",
    "Business Users and Children",
    "Changes and Contact",
  ]);
  await expect(page.locator("main")).toContainText("Web3Forms");
  await expect(page.locator("main")).toContainText("up to three years");
  await expect(
    page.locator('a[href="mailto:info@tio2malaysia.com"]').first(),
  ).toBeVisible();
});

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

test("products filters and limits detail links", async ({ page }) => {
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
  expect(
    hrefs.every((href) => href === "/products/" || href === "/products/m-350/"),
  ).toBe(true);
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
  ).toEqual(["https://tio2products.com/products/m-350/"]);
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
