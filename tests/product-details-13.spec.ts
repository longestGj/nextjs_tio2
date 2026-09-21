import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { productDetailCandidates } from "../lib/content/product-detail-candidates.mjs";

type Contract = {
  reviewId: string;
  identity: { pageId: string; gradeCode: string; slug: string; path: string };
  seo: { title: string; description: string; h1: string };
  hero: { summaryLead: string; summaryBody: string; proofs: string[]; visual: Record<string, string>; facts: Array<{ label: string; value: string }>; actions: Array<{ label: string; href: string }> };
  positioning: { heading: string; lead: string; body: string; decisionPoints: string[]; contextualLink?: { label: string; href: string } };
  applications: { heading: string; intro: string; items: Array<{ category: string; title: string; body: string; href?: string; relatedTargets?: Array<{ href: string }> }> };
  evaluation: { heading: string; intro: string; groups: Array<{ heading: string; items: string[] }>; disclaimer: string };
  technical: { heading: string; intro: string; sourceLabel: string; columns: string[]; rows: Array<Record<string, string>>; footnote?: string; note: string; action: { label: string; href: string } };
  markets: { heading: string; intro: string; items: Array<{ label: string; href: string }>; note: string };
  evidenceLedger: unknown;
};

const contracts = new Map(
  productDetailCandidates.map((candidate) => [
    candidate.slug,
    JSON.parse(
      readFileSync(join(process.cwd(), "content", "product-details", candidate.contractFile), "utf8"),
    ) as Contract,
  ]),
);
const allGrades = ["M-350", ...productDetailCandidates.map((candidate) => candidate.gradeCode)];

const gradeRestrictions: Record<string, RegExp[]> = {
  "m-895": [/food[- ]contact/i],
  "m-340": [/\brubber\b/i],
  "m-886": [/food[- ]contact/i],
  "m-210": [/\bFDA\b/i, /food[- ]contact/i, /\brubber\b/i],
  "m-200": [/CR-200/i],
  "m-996": [/\bM-2196\b/i, /\bsuperior(?:ity)?\b/i, /\bequivalent|equivalence\b/i, /\branking?\b/i],
  "m-2196": [/\bM-996\b/i],
  "m-2377": [/\brubber\b/i, /specialty materials/i],
  "cr-901": [/\bchloride\b/i, /\bsulfate\b/i, /cosmetics?/i, /\bmedicine\b/i, /non-toxic/i, /\bsafety\b/i, /\bUV\b/i, /anti-aging/i, /batch stability/i],
};

for (const candidate of productDetailCandidates) {
  const contract = contracts.get(candidate.slug)!;
  test(`${candidate.gradeCode} renders its approved public contract`, async ({ page }) => {
    const response = await page.goto(candidate.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(contract.seo.h1);
    const main = page.locator("main");
    const visibleTexts = [
      contract.hero.summaryLead,
      contract.hero.summaryBody,
      ...contract.hero.proofs,
      ...Object.values(contract.hero.visual),
      ...contract.hero.facts.flatMap((fact) => [fact.label, fact.value]),
      contract.positioning.heading,
      contract.positioning.lead,
      contract.positioning.body,
      ...contract.positioning.decisionPoints,
      contract.positioning.contextualLink?.label,
      contract.applications.heading,
      contract.applications.intro,
      ...contract.applications.items.flatMap((item) => [item.category, item.title, item.body]),
      contract.evaluation.heading,
      contract.evaluation.intro,
      ...contract.evaluation.groups.flatMap((group) => [group.heading, ...group.items]),
      contract.evaluation.disclaimer,
      contract.technical.heading,
      contract.technical.intro,
      contract.technical.sourceLabel,
      contract.technical.footnote,
      contract.technical.note,
      contract.markets.heading,
      contract.markets.intro,
      ...contract.markets.items.map((item) => item.label),
      contract.markets.note,
    ].filter((value): value is string => Boolean(value));
    for (const visibleText of visibleTexts) {
      await expect(main).toContainText(visibleText);
    }
    await expect(main.locator("tbody tr")).toHaveCount(contract.technical.rows.length);
    const firstRow = contract.technical.rows[0];
    for (const value of Object.values(firstRow)) {
      await expect(main.locator("tbody tr").first()).toContainText(value);
    }
  });

  test(`${candidate.gradeCode} head and schema match the visible grade`, async ({ page }) => {
    await page.goto(candidate.path);
    const canonical = `https://tio2products.com${candidate.path}`;
    await expect(page).toHaveTitle(contract.seo.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", contract.seo.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /index/i);
    await expect(robots).toHaveAttribute("content", /follow/i);
    await expect(robots).not.toHaveAttribute("content", /noindex|nofollow/i);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", contract.seo.title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", contract.seo.description);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
    const product = schema["@graph"].find((node: { "@type": string }) => node["@type"] === "Product");
    const breadcrumb = schema["@graph"].find((node: { "@type": string }) => node["@type"] === "BreadcrumbList");
    expect(product).toMatchObject({
      "@id": `${canonical}#product`,
      name: `${candidate.gradeCode} Titanium Dioxide`,
      sku: candidate.gradeCode,
      url: canonical,
      description: `${contract.hero.summaryLead} ${contract.hero.summaryBody}`,
    });
    expect(product.additionalProperty).toEqual(
      contract.technical.rows.map((row) => {
        const values = Object.values(row);
        return {
          "@type": "PropertyValue",
          name: values[0],
          value: values.slice(1).map((value, index) => `${contract.technical.columns[index + 1]}: ${value}`).join("; "),
        };
      }),
    );
    for (const key of ["offers", "aggregateRating", "gtin", "mpn", "certification", "manufacturer", "countryOfOrigin"]) {
      expect(product).not.toHaveProperty(key);
    }
    expect(breadcrumb.itemListElement.map((item: { item: string }) => item.item)).toEqual([
      "https://tio2products.com/",
      "https://tio2products.com/products/",
      canonical,
    ]);
    expect(breadcrumb.itemListElement.map((item: { name: string }) => item.name)).toEqual(["Home", "Products", candidate.gradeCode]);
  });

  test(`${candidate.gradeCode} omits held actions and cross-grade leakage`, async ({ page }) => {
    await page.goto(candidate.path);
    const main = page.locator("main");
    const heldHrefs = [
      ...contract.hero.actions.map((action) => action.href),
      contract.technical.action.href,
      contract.positioning.contextualLink?.href,
      ...contract.applications.items.flatMap((item) => [item.href, ...(item.relatedTargets ?? []).map((target) => target.href)]),
      ...contract.markets.items.map((item) => item.href),
    ].filter(Boolean) as string[];
    for (const href of new Set(heldHrefs)) {
      await expect(main.locator(`a[href="${href}"]`)).toHaveCount(0);
    }
    for (const label of [...contract.hero.actions.map((action) => action.label), contract.technical.action.label]) {
      await expect(main).not.toContainText(label);
    }
    const text = await main.innerText();
    for (const grade of allGrades.filter((grade) => grade !== candidate.gradeCode)) {
      expect(text, `${candidate.gradeCode} leaked ${grade}`).not.toMatch(new RegExp(`\\b${grade.replace("-", "[- ]?")}\\b`, "i"));
    }
    for (const pattern of gradeRestrictions[candidate.slug] ?? []) expect(text).not.toMatch(pattern);
    const html = await page.content();
    for (const forbidden of [candidate.pageId, contract.reviewId, "evidenceLedger", "approved_for_preview", "contentRevision", "sourceRefs", "PRODUCT-000", "HOME-001", "tio2malaysia.com"]) {
      expect(html).not.toContain(forbidden);
    }
  });
}

test("unknown product detail slugs fail closed", async ({ page }) => {
  const response = await page.goto("/products/not-a-grade/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("main h1")).toHaveCount(0);
  const body = await page.locator("body").innerText();
  for (const grade of productDetailCandidates.map((candidate) => candidate.gradeCode)) expect(body).not.toContain(grade);
});
