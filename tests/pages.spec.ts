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

async function fillValidRfq(page: import("@playwright/test").Page) {
  const form = page.locator("form");
  await form.locator('[name="grade_id"]').selectOption("M-350");
  await form.locator('[name="application_id"]').selectOption("Coatings");
  await form.locator('[name="quantity_mt"]').fill("20");
  await form.locator('[name="destination_country"]').fill("Malaysia");
  await form.locator('[name="destination_port_city"]').fill("Port Klang");
  await form.locator('[name="company_name"]').fill("IKHLAS Trading");
  await form.locator('[name="contact_name"]').fill("Test Buyer");
  await form.locator('[name="business_email"]').fill("buyer@company.com");
  await form.locator('[name="phone_whatsapp"]').fill("+60 12 345 6789");
  await form.locator('[name="website"]').fill("https://company.com");
  await form
    .locator('[name="additional_requirements"]')
    .fill("Please quote standard packaging.");
  return form;
}

test("Web3Forms accepts an explicit provider success and creates the receipt", async ({
  page,
}) => {
  let submissions = 0;
  await page.route("https://api.web3forms.com/submit", async (route) => {
    submissions += 1;
    const payload = route.request().postDataJSON();
    expect(payload).toMatchObject({
      access_key: "00000000-0000-4000-8000-000000000001",
      subject: "TiO2 Malaysia quotation request",
      from_name: "TiO2 Malaysia RFQ",
      email: "buyer@company.com",
      site_scope: "tio2-my",
      page_id: "CONV-RFQ",
      workflow_type: "rfq",
      locale: "en",
      grade_id: "M-350",
      application_id: "Coatings",
      quantity_mt: "20",
      quantity_unit: "MT",
      destination_country: "Malaysia",
      destination_port_city: "Port Klang",
      company_name: "IKHLAS Trading",
      contact_name: "Test Buyer",
      business_email: "buyer@company.com",
      phone_whatsapp: "+60 12 345 6789",
      website: "https://company.com",
      additional_requirements: "Please quote standard packaging.",
    });
    expect(payload.request_token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"success":true}',
    });
  });
  await page.goto("/request-a-quote/");
  const form = await fillValidRfq(page);
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  await expect(page).toHaveURL(/\/thank-you\/\?request=quote$/);
  await expect(page.locator("h1")).toHaveText(
    "Thank you. We’ve received your quotation request.",
  );
  expect(submissions).toBe(1);
});

for (const responseCase of [
  { name: "HTTP 400", status: 400, contentType: "application/json", body: '{"success":false,"message":"Invalid request"}' },
  { name: "HTTP 422", status: 422, contentType: "application/json", body: '{"success":false,"message":"Invalid email"}' },
  { name: "HTTP 429", status: 429, contentType: "application/json", body: '{"success":false}' },
  { name: "HTTP 500", status: 500, contentType: "application/json", body: '{"success":false}' },
  { name: "success false", status: 200, contentType: "application/json", body: '{"success":false}' },
  { name: "malformed JSON", status: 200, contentType: "application/json", body: "{" },
  { name: "HTML body", status: 200, contentType: "text/html", body: "<html>upstream error</html>" },
] as const) {
  test(`Web3Forms ${responseCase.name} remains unconfirmed and retains values`, async ({
    page,
  }) => {
    await page.route("https://api.web3forms.com/submit", (route) =>
      route.fulfill({
        status: responseCase.status,
        contentType: responseCase.contentType,
        body: responseCase.body,
      }),
    );
    await page.goto("/request-a-quote/");
    const form = await fillValidRfq(page);
    await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
    await expect(form.locator('[role="alert"]')).toContainText(
      "Something went wrong while submitting your request.",
    );
    await expect(form.locator('[name="business_email"]')).toHaveValue(
      "buyer@company.com",
    );
    expect(await page.evaluate((key) => sessionStorage.getItem(key), thankYouReceiptKey)).toBeNull();
    await form.getByRole("button", { name: "TRY AGAIN" }).click();
    await expect(form.locator('[role="alert"]')).toHaveCount(0);
  });
}

test("Web3Forms network abort never creates success", async ({ page }) => {
  await page.route("https://api.web3forms.com/submit", (route) =>
    route.abort("failed"),
  );
  await page.goto("/request-a-quote/");
  const form = await fillValidRfq(page);
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  await expect(form.locator('[role="alert"]')).toContainText(
    "Something went wrong while submitting your request.",
  );
  expect(await page.evaluate((key) => sessionStorage.getItem(key), thankYouReceiptKey)).toBeNull();
});

test("Web3Forms timeout remains unconfirmed", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
      nativeSetTimeout(handler, timeout === 10_000 ? 10 : timeout, ...args)) as typeof window.setTimeout;
  });
  await page.route("https://api.web3forms.com/submit", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"success":true}',
    });
  });
  await page.goto("/request-a-quote/");
  const form = await fillValidRfq(page);
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  await expect(form.locator('[role="alert"]')).toContainText(
    "Something went wrong while submitting your request.",
  );
  expect(await page.evaluate((key) => sessionStorage.getItem(key), thankYouReceiptKey)).toBeNull();
});

test("submission retry keeps values and uses a new request token", async ({ page }) => {
  const requestTokens: string[] = [];
  await page.route("https://api.web3forms.com/submit", async (route) => {
    const payload = route.request().postDataJSON();
    requestTokens.push(payload.request_token);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: requestTokens.length === 1 ? '{"success":false}' : '{"success":true}',
    });
  });
  await page.goto("/request-a-quote/");
  const form = await fillValidRfq(page);
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  await expect(form.locator('[role="alert"]')).toBeFocused();
  await form.getByRole("button", { name: "TRY AGAIN" }).click();
  await expect(form.locator('[name="business_email"]')).toHaveValue(
    "buyer@company.com",
  );
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  await expect(page).toHaveURL(/\/thank-you\/\?request=quote$/);
  expect(requestTokens).toHaveLength(2);
  expect(requestTokens[1]).not.toBe(requestTokens[0]);
});

test("submission double dispatch sends only one pending request", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let submissions = 0;
  await page.route("https://api.web3forms.com/submit", async (route) => {
    submissions += 1;
    await gate;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"success":true}',
    });
  });
  await page.goto("/request-a-quote/");
  const form = await fillValidRfq(page);
  await form.dispatchEvent("submit");
  await form.dispatchEvent("submit");
  await expect(form.getByRole("button", { name: "SUBMITTING…" })).toBeDisabled();
  expect(submissions).toBe(1);
  release();
  await expect(page).toHaveURL(/\/thank-you\/\?request=quote$/);
});

test("RFQ accepts only approved query prefills", async ({ page }) => {
  await page.goto(
    "/request-a-quote/?grade_id=M-350&application_id=Coatings&destination_country=Malaysia&document_needs%5B%5D=TDS",
  );
  await expect(page.locator('[name="grade_id"]')).toHaveValue("M-350");
  await expect(page.locator('[name="application_id"]')).toHaveValue(
    "Coatings",
  );
  await expect(page.locator('[name="destination_country"]')).toHaveValue(
    "Malaysia",
  );
  await expect(page.locator('[name="additional_requirements"]')).toHaveValue(
    "TDS",
  );
});

test("prefill rejects whitespace, unknown values, and overlong destinations", async ({
  page,
}) => {
  const overlong = "A".repeat(101);
  await page.goto(
    `/request-a-quote/?grade_id=%20M-350%20&application_id=Unknown&destination_country=${overlong}`,
  );
  await expect(page.locator('[name="grade_id"]')).toHaveValue("");
  await expect(page.locator('[name="application_id"]')).toHaveValue("");
  await expect(page.locator('[name="destination_country"]')).toHaveValue("");
});

test("prefill deduplicates approved documents and rejects unapproved labels", async ({
  page,
}) => {
  await page.goto(
    "/request-a-quote/?document_needs%5B%5D=TDS&document_needs%5B%5D=Private&document_needs%5B%5D=TDS&document_needs%5B%5D=COA",
  );
  await expect(page.locator('[name="additional_requirements"]')).toHaveValue(
    "TDS; COA",
  );
});

test("prefill applies Sulfate only to M-2377 and excludes Specialty Materials", async ({
  page,
}) => {
  await page.goto(
    "/request-a-quote/?grade_id=M-2377&application_id=Specialty%20Materials&process_context=Sulfate&document_needs%5B%5D=SDS",
  );
  await expect(page.locator('[name="grade_id"]')).toHaveValue("M-2377");
  await expect(page.locator('[name="application_id"]')).toHaveValue("");
  await expect(page.locator('[name="additional_requirements"]')).toHaveValue(
    "Sulfate\nSDS",
  );
  await page.goto(
    "/request-a-quote/?grade_id=M-350&process_context=Sulfate",
  );
  await expect(page.locator('[name="additional_requirements"]')).toHaveValue("");
});

test("prefill accepts Packaging review and approved market fallbacks", async ({
  page,
}) => {
  await page.goto(
    "/request-a-quote/?market=European%20Union&resource_context=Packaging%20review",
  );
  await expect(page.locator('[name="destination_country"]')).toHaveValue(
    "European Union",
  );
  await expect(page.locator('[name="additional_requirements"]')).toHaveValue(
    "Packaging review",
  );
});

test("prefill forwards only approved source context combinations", async ({ page }) => {
  const payloads: Record<string, string>[] = [];
  await page.route("https://api.web3forms.com/submit", async (route) => {
    payloads.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"success":false}',
    });
  });
  await page.goto(
    "/request-a-quote/?source_page_id=APP-000&interest=alternative-origin-sourcing",
  );
  let form = await fillValidRfq(page);
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  expect(payloads[0]).toMatchObject({ source_page_id: "APP-000" });
  expect(payloads[0]).not.toHaveProperty("interest");

  await page.goto(
    "/request-a-quote/?source_page_id=RES-ORIGIN&interest=alternative-origin-sourcing",
  );
  form = await fillValidRfq(page);
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  expect(payloads[1]).toMatchObject({
    source_page_id: "RES-ORIGIN",
    interest: "alternative-origin-sourcing",
  });

  await page.goto(
    "/request-a-quote/?source_page_id=UNAPPROVED&interest=alternative-origin-sourcing",
  );
  form = await fillValidRfq(page);
  await form.getByRole("button", { name: "REQUEST QUOTE" }).click();
  expect(payloads[2]).not.toHaveProperty("source_page_id");
  expect(payloads[2]).not.toHaveProperty("interest");
});

test("draft stores and restores only the approved four fields", async ({ page }) => {
  await page.goto("/request-a-quote/");
  const originalUrl = page.url();
  const form = page.locator("form");
  await form.locator('[name="grade_id"]').selectOption("M-510");
  await form.locator('[name="application_id"]').selectOption("Plastics");
  await form.locator('[name="destination_country"]').fill("United Kingdom");
  await form
    .locator('[name="additional_requirements"]')
    .fill("TDS; Packaging review");
  await form.locator('[name="company_name"]').fill("Must not persist");
  await form.locator('[name="business_email"]').fill("private@company.com");
  expect(page.url()).toBe(originalUrl);
  expect(await page.evaluate(() => history.state.rfqDraft)).toEqual({
    grade_id: "M-510",
    application_id: "Plastics",
    destination_country: "United Kingdom",
    additional_requirements: "TDS; Packaging review",
  });
  await page.reload();
  await expect(page.locator('[name="grade_id"]')).toHaveValue("M-510");
  await expect(page.locator('[name="application_id"]')).toHaveValue(
    "Plastics",
  );
  await expect(page.locator('[name="destination_country"]')).toHaveValue(
    "United Kingdom",
  );
  await expect(page.locator('[name="additional_requirements"]')).toHaveValue(
    "TDS; Packaging review",
  );
  await expect(page.locator('[name="company_name"]')).toHaveValue("");
  await expect(page.locator('[name="business_email"]')).toHaveValue("");
});

test("clean RFQ links stay free of automatic M350 prefill", async ({ page }) => {
  for (const route of ["/", "/products/m-350/"]) {
    await page.goto(route);
    const links = page.locator('a[href^="/request-a-quote/"]');
    expect(await links.count()).toBeGreaterThan(0);
    for (const href of await links.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    )) {
      expect(href).toBe("/request-a-quote/");
    }
  }
});

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
