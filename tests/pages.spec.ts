import { test, expect } from "@playwright/test";

const thankYouReceiptKey = "tio2-my:thank-you:receipt:v1";

const rfqFieldNames = [
  "grade_id",
  "application_id",
  "quantity_mt",
  "destination_country",
  "destination_port_city",
  "company_name",
  "contact_name",
  "business_email",
  "phone_whatsapp",
  "website",
  "additional_requirements",
];

test("RFQ preserves the approved field contract", async ({ page }) => {
  await page.goto("/request-a-quote/");
  await expect(page.locator("h1")).toHaveText(
    "Request a Titanium Dioxide Quote",
  );
  const form = page.locator("form");
  await expect(form).toHaveCount(1);
  expect(await form.locator("[name]").evaluateAll((fields) =>
    fields.map((field) => field.getAttribute("name")),
  )).toEqual(rfqFieldNames);
  await expect(form.locator('[name="grade_id"] option')).toHaveText([
    "Select a product or grade",
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
    "Not sure / Need help",
  ]);
  await expect(form.locator('[name="application_id"] option')).toHaveText([
    "Select an application",
    "Coatings",
    "Plastics",
    "Masterbatch",
    "Printing Inks",
    "Paper",
    "Specialty Materials",
    "Other / Not sure",
  ]);

  for (const name of [
    "grade_id",
    "application_id",
    "quantity_mt",
    "destination_country",
    "company_name",
    "contact_name",
    "business_email",
  ]) {
    await expect(form.locator(`[name="${name}"]`)).toHaveAttribute("required");
    await expect(form.locator(`[name="${name}"]`)).toHaveAttribute(
      "aria-required",
      "true",
    );
  }

  await expect(form.locator('[name="quantity_mt"]')).toHaveAttribute("min", "0");
  await expect(form.locator('[name="quantity_mt"]')).toHaveAttribute(
    "step",
    "any",
  );
  for (const [name, maxLength] of Object.entries({
    destination_country: "100",
    destination_port_city: "120",
    company_name: "160",
    contact_name: "100",
    business_email: "254",
    phone_whatsapp: "40",
    website: "2048",
    additional_requirements: "2000",
  })) {
    await expect(form.locator(`[name="${name}"]`)).toHaveAttribute(
      "maxlength",
      maxLength,
    );
  }
  await expect(form).toContainText("Add this only if it is already known.");
  await expect(form).toContainText(
    "Use the business email where we can respond to this request.",
  );
  await expect(form).toContainText(
    "Add any non-confidential specification, packaging, schedule, document or other context that may help us review the request.",
  );
  await expect(form).toContainText(
    "We use the information you provide to review and respond to your quotation request.",
  );
  await expect(page.getByRole("heading", { name: "Other request types" })).toBeVisible();
});

test("RFQ empty submit exposes the exact accessible error contract", async ({
  page,
}) => {
  await page.goto("/request-a-quote/");
  const form = page.locator("form");
  test.skip((await form.count()) === 0, "requires the configured RFQ build");
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  const summary = form.locator('[role="alert"]');
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Please review the highlighted fields.");
  await expect(summary).toContainText(
    "Correct the information below and try again. Your other entries are still here.",
  );
  for (const [name, message] of Object.entries({
    grade_id: "Select a product or grade, or choose “Not sure / Need help.”",
    application_id: "Select an application.",
    quantity_mt: "Enter a quantity greater than 0.",
    destination_country: "Enter a destination country.",
    company_name: "Enter your company name.",
    contact_name: "Enter your name.",
    business_email: "Enter your business email.",
  })) {
    await expect(form.locator(`#rfq-${name}-error`)).toHaveText(message);
  }
  await expect(form.locator('[name="grade_id"]')).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("RFQ preserves exact email and website validation messages", async ({
  page,
}) => {
  await page.goto("/request-a-quote/");
  const form = page.locator("form");
  test.skip((await form.count()) === 0, "requires the configured RFQ build");
  await form.locator('[name="grade_id"]').selectOption("M-350");
  await form.locator('[name="application_id"]').selectOption("Coatings");
  await form.locator('[name="quantity_mt"]').fill("1");
  await form.locator('[name="destination_country"]').fill("Malaysia");
  await form.locator('[name="company_name"]').fill("IKHLAS");
  await form.locator('[name="contact_name"]').fill("Buyer");
  await form.locator('[name="business_email"]').fill("not-an-email");
  await form.locator('[name="website"]').fill("company.example");
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  await expect(form.locator("#rfq-business_email-error")).toHaveText(
    "Enter a business email in the format name@company.com.",
  );
  await expect(form.locator("#rfq-website-error")).toHaveText(
    "Enter a complete website address or remove this optional value.",
  );
});

test("RFQ preserves the remaining boundary error messages", async ({ page }) => {
  await page.goto("/request-a-quote/");
  const form = page.locator("form");
  test.skip((await form.count()) === 0, "requires the configured RFQ build");
  await form.locator('[name="grade_id"]').selectOption("M-350");
  await form.locator('[name="application_id"]').selectOption("Coatings");
  await form.locator('[name="quantity_mt"]').fill("1");
  await form.locator('[name="business_email"]').fill("buyer@company.com");

  async function setUncheckedValue(name: string, value: string) {
    await form.locator(`[name="${name}"]`).evaluate((node, nextValue) => {
      const prototype =
        node instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      setter?.call(node, nextValue);
      node.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
  }

  await setUncheckedValue("destination_country", "国".repeat(101));
  await setUncheckedValue("destination_port_city", "P".repeat(121));
  await setUncheckedValue("company_name", "C".repeat(161));
  await setUncheckedValue("contact_name", "N".repeat(101));
  await setUncheckedValue("phone_whatsapp", "1".repeat(41));
  await setUncheckedValue("additional_requirements", "R".repeat(2001));
  await form.locator('[name="website"]').fill("https://user:pass@example.com");
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();

  for (const [name, message] of Object.entries({
    destination_country: "Keep the destination country to 100 characters or fewer.",
    destination_port_city: "Keep the destination port or city to 120 characters or fewer.",
    company_name: "Keep your company name to 160 characters or fewer.",
    contact_name: "Keep your name to 100 characters or fewer.",
    phone_whatsapp: "Keep the phone or WhatsApp number to 40 characters or fewer.",
    website: "Enter a complete website address or remove this optional value.",
    additional_requirements: "Keep additional requirements to 2,000 characters or fewer.",
  })) {
    await expect(form.locator(`#rfq-${name}-error`)).toHaveText(message);
  }
});

test("RFQ receiver unavailable fails closed", async ({ page }) => {
  await page.goto("/request-a-quote/");
  const form = page.locator("form");
  test.skip((await form.count()) === 1, "requires the unconfigured RFQ build");
  await expect(form).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "The quotation request form is temporarily unavailable.",
    }),
  ).toBeVisible();
  await expect(page.locator("main")).toContainText(
    "No request has been submitted. Please return later and try again.",
  );
});

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
